import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import express, { NextFunction, Request, Response } from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { PrismaClient } from "@prisma/client";
import { RegisterRoutes } from "../build/routes";
import { prisma } from "../src/utils/client";
import { importNewsContent, loadNewsContent } from "../prisma/seeds/news";

const url = new URL(process.env.DATABASE_URL || "postgresql://invalid/invalid");
if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.pathname !== "/gcv_news_test") throw new Error("Use an isolated localhost gcv_news_test database");
const db = new PrismaClient();
let server: Server;
let base: string;
before(async () => {
  const app = express(); app.use(express.json()); RegisterRoutes(app);
  app.use((error: { status?: number; fields?: unknown }, _req: Request, res: Response, _next: NextFunction) => res.status(error.status || (error.fields ? 400 : 500)).json({ message: "Request failed" }));
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});
beforeEach(async () => { await db.news.deleteMany(); await db.announcement.deleteMany(); });
after(async () => {
  await db.news.deleteMany(); await db.announcement.deleteMany();
  await new Promise<void>(resolve => server.close(() => resolve()));
  await Promise.all([db.$disconnect(), prisma.$disconnect()]);
});

test("dry run writes nothing; full import preserves all source fields and dates", async () => {
  const dry = await importNewsContent(db, true);
  assert.deepEqual(dry.wouldInsert, { news: 8, announcements: 3 });
  assert.equal(await db.news.count(), 0); assert.equal(await db.announcement.count(), 0);
  assert.deepEqual((await importNewsContent(db)).inserted, { news: 8, announcements: 3 });
  const source = loadNewsContent();
  for (const item of source.news) {
    const saved = await db.news.findUniqueOrThrow({ where: { id: item.id } });
    for (const [key, value] of Object.entries(item)) assert.deepEqual(saved[key as keyof typeof saved], value);
  }
  for (const item of source.announcements) {
    const saved = await db.announcement.findUniqueOrThrow({ where: { id: item.id } });
    for (const [key, value] of Object.entries(item)) assert.deepEqual(saved[key as keyof typeof saved], value);
  }
});

test("reruns preserve admin edits, renamed slugs, counters, and existing slug matches", async () => {
  const source = loadNewsContent(); const first = source.news[0];
  await db.news.create({ data: { ...first, id: "pre-existing-article", title: "Existing admin article", viewCount: 17 } });
  assert.deepEqual((await importNewsContent(db)).inserted, { news: 7, announcements: 3 });
  const article = source.news[1]; const announcement = source.announcements[0];
  await db.news.update({ where: { id: article.id }, data: { slug: "admin-renamed-slug", title: "Edited news", viewCount: 999 } });
  await db.announcement.update({ where: { id: announcement.id }, data: { title: "Edited announcement", priority: "NORMAL" } });
  assert.deepEqual((await importNewsContent(db)).inserted, { news: 0, announcements: 0 });
  assert.equal(await db.news.count(), 8); assert.equal(await db.announcement.count(), 3);
  assert.equal((await db.news.findUniqueOrThrow({ where: { id: "pre-existing-article" } })).title, "Existing admin article");
  const edited = await db.news.findUniqueOrThrow({ where: { id: article.id } });
  assert.equal(edited.title, "Edited news"); assert.equal(edited.slug, "admin-renamed-slug"); assert.equal(edited.viewCount, 999);
  assert.equal((await db.announcement.findUniqueOrThrow({ where: { id: announcement.id } })).title, "Edited announcement");
});

test("public HTTP APIs serve imported articles, filters, original slugs and announcements", async () => {
  await importNewsContent(db);
  const response = await fetch(`${base}/news?limit=100`); assert.equal(response.status, 200);
  const news = await response.json(); assert.equal(news.totalItems, 8); assert.equal(news.data.length, 8);
  const source = loadNewsContent();
  const country = source.news.find(item => item.country)?.country; assert(country);
  const filtered = await (await fetch(`${base}/news?country=${encodeURIComponent(country)}`)).json();
  assert(filtered.data.length > 0); assert(filtered.data.every((item: { country: string }) => item.country === country));
  const detail = await fetch(`${base}/news/slug/${source.news[0].slug}`); assert.equal(detail.status, 200);
  assert.equal((await detail.json()).data.content, source.news[0].content);
  const announcements = await fetch(`${base}/announcements`); assert.equal(announcements.status, 200);
  const body = await announcements.json(); assert.equal(body.data.length, 3);
  assert(body.data.some((item: { priority: string }) => item.priority === "HIGH"));
  await db.announcement.update({ where: { id: source.announcements[0].id }, data: { title: "Backend title change" } });
  assert((await (await fetch(`${base}/announcements`)).json()).data.some((item: { title: string }) => item.title === "Backend title change"));
  assert.equal((await fetch(`${base}/news`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(source.news[0]) })).status, 401);
});
