import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export async function retryFailedContactEmail(db: PrismaClient, id: string): Promise<boolean> {
  const changed = await db.contactEmailJob.updateMany({
    where: { id, status: "FAILED" },
    data: { status: "PENDING", attempts: 0, nextAttemptAt: new Date(), lockedUntil: null, lockToken: null, lastError: null },
  });
  return changed.count === 1;
}

async function main() {
  const db = new PrismaClient();
  try {
    const args = process.argv.slice(2);
    if (!args.length || args.length === 1 && args[0] === "--list") {
      const counts = await db.contactEmailJob.groupBy({ by: ["status"], _count: { _all: true } });
      const failed = await db.contactEmailJob.findMany({
        where: { status: "FAILED" }, orderBy: { updatedAt: "desc" }, take: 50,
        select: { id: true, contactId: true, kind: true, attempts: true, lastError: true, updatedAt: true },
      });
      console.log(JSON.stringify({ counts, latestFailed: failed }, null, 2));
    } else if (args.length === 2 && args[0] === "--retry" && /^[0-9a-f-]{36}$/i.test(args[1])) {
      const queued = await retryFailedContactEmail(db, args[1]);
      console.log(JSON.stringify({ id: args[1], queued }));
      if (!queued) process.exitCode = 1;
    } else throw new Error("Use --list or --retry <failed-job-id>");
  } finally { await db.$disconnect(); }
}

if (require.main === module) main().catch(() => { console.error("Contact email job operation failed; check the database connection and arguments."); process.exitCode = 1; });
