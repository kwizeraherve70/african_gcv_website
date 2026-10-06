import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { v5 as uuidv5 } from "uuid";
import { z } from "zod";

const categories = { "Pi Network": "PI_NETWORK", "GCV Movement": "GCV_MOVEMENT", Events: "EVENTS", Community: "COMMUNITY" } as const;
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => !Number.isNaN(Date.parse(value)), "Invalid date");
const text = z.string().min(1);
const snapshotSchema = z.object({
  news: z.array(z.object({
    id: text, title: text, slug: text, excerpt: text, content: text,
    featuredImage: z.string().url(), category: z.enum(["Pi Network", "GCV Movement", "Events", "Community"]),
    author: text, publishedAt: date, readTime: text, viewCount: z.number().int().nonnegative(), country: text.optional(),
  })),
  announcements: z.array(z.object({ id: text, title: text, excerpt: text, content: text, publishedAt: date, priority: z.enum(["high", "normal"]) })),
});

export function loadNewsContent() {
  const snapshot = snapshotSchema.parse(JSON.parse(readFileSync(join(__dirname, "news-content.json"), "utf8")));
  if (new Set(snapshot.news.map(item => item.slug)).size !== snapshot.news.length ||
      new Set(snapshot.news.map(item => item.id)).size !== snapshot.news.length ||
      new Set(snapshot.announcements.map(item => item.id)).size !== snapshot.announcements.length) {
    throw new Error("Duplicate source IDs or article slugs");
  }
  const news: Prisma.NewsCreateManyInput[] = snapshot.news.map(item => ({
    ...item, id: uuidv5(`gcv:legacy-news:${item.id}`, uuidv5.URL), category: categories[item.category], publishedAt: new Date(item.publishedAt),
  }));
  const announcements: Prisma.AnnouncementCreateManyInput[] = snapshot.announcements.map(item => ({
    ...item, id: uuidv5(`gcv:legacy-announcement:${item.id}`, uuidv5.URL), priority: item.priority === "high" ? "HIGH" : "NORMAL", publishedAt: new Date(item.publishedAt),
  }));
  return { news, announcements };
}

/** Dedicated, insert-only import: never run the unrelated account/catalog seed. */
export async function importNewsContent(db: PrismaClient, dryRun = false) {
  const source = loadNewsContent();
  return db.$transaction(async tx => {
    const existingNews = await tx.news.findMany({ where: { OR: [{ id: { in: source.news.map(item => item.id!) } }, { slug: { in: source.news.map(item => item.slug) } }] }, select: { id: true, slug: true } });
    const existingAnnouncements = await tx.announcement.findMany({ where: { id: { in: source.announcements.map(item => item.id!) } }, select: { id: true } });
    const missingNews = source.news.filter(item => !existingNews.some(existing => existing.id === item.id || existing.slug === item.slug));
    const missingAnnouncements = source.announcements.filter(item => !existingAnnouncements.some(existing => existing.id === item.id));
    const insertedNews = dryRun ? 0 : (await tx.news.createMany({ data: missingNews, skipDuplicates: true })).count;
    const insertedAnnouncements = dryRun ? 0 : (await tx.announcement.createMany({ data: missingAnnouncements, skipDuplicates: true })).count;
    return { dryRun, source: { news: source.news.length, announcements: source.announcements.length }, wouldInsert: { news: missingNews.length, announcements: missingAnnouncements.length }, inserted: { news: insertedNews, announcements: insertedAnnouncements } };
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== "--dry-run")) throw new Error("Usage: npm run seed:news -- [--dry-run]");
  const db = new PrismaClient();
  importNewsContent(db, args.includes("--dry-run"))
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(() => { console.error("News import failed; no partial import was committed. Check the database and source snapshot."); process.exitCode = 1; })
    .finally(() => db.$disconnect());
}
