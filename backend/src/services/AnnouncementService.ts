import { prisma } from "../utils/client";

export interface AnnouncementRecord {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
  priority: "HIGH" | "NORMAL";
}

export class AnnouncementService {
  static async list(): Promise<AnnouncementRecord[]> {
    return prisma.announcement.findMany({
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
      select: { id: true, title: true, excerpt: true, content: true, publishedAt: true, priority: true },
    });
  }
}
