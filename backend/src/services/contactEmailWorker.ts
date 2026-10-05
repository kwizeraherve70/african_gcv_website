import { ContactEmailJob, PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/client";
import { EmailMessage, sendEmailBounded } from "../utils/email";

export const CONTACT_EMAIL_MAX_ATTEMPTS = 6;
export const CONTACT_EMAIL_LEASE_MS = 90_000;
const RETRY_DELAYS_MS = [60_000, 300_000, 900_000, 3_600_000, 21_600_000];

export function retryDelay(attempts: number): number {
  return RETRY_DELAYS_MS[Math.min(Math.max(attempts - 1, 0), RETRY_DELAYS_MS.length - 1)];
}

function errorCode(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? error.code : null;
  // Do not persist or log SMTP messages that may include addresses or credentials.
  return typeof code === "string" && /^[A-Z0-9_]{1,40}$/.test(code) ? code : "EMAIL_DELIVERY_FAILED";
}

export class ContactEmailWorker {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly deliver: (message: EmailMessage) => Promise<void> = sendEmailBounded,
  ) {}

  /** One atomic claim, safe across API replicas; SMTP runs outside the DB lock. */
  async runOnce(): Promise<boolean> {
    const lockToken = randomUUID();
    // A crash on the last allowed attempt must not strand a PROCESSING row.
    await this.db.contactEmailJob.updateMany({
      where: { status: "PROCESSING", lockedUntil: { lte: new Date() }, attempts: { gte: CONTACT_EMAIL_MAX_ATTEMPTS } },
      data: { status: "FAILED", lockedUntil: null, lockToken: null, lastError: "DELIVERY_OUTCOME_UNKNOWN" },
    });
    const jobs = await this.db.$queryRaw<ContactEmailJob[]>`
      UPDATE "ContactEmailJob" AS job
      SET "status" = 'PROCESSING', "attempts" = job."attempts" + 1,
          "lockedUntil" = CURRENT_TIMESTAMP + ${CONTACT_EMAIL_LEASE_MS} * INTERVAL '1 millisecond',
          "lockToken" = ${lockToken}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE job."id" = (
        SELECT "id" FROM "ContactEmailJob"
        WHERE "attempts" < ${CONTACT_EMAIL_MAX_ATTEMPTS}
          AND (("status" = 'PENDING' AND "nextAttemptAt" <= CURRENT_TIMESTAMP)
            OR ("status" = 'PROCESSING' AND "lockedUntil" <= CURRENT_TIMESTAMP))
        ORDER BY "nextAttemptAt", "createdAt", "id"
        FOR UPDATE SKIP LOCKED LIMIT 1
      ) RETURNING job.*`;
    const job = jobs[0];
    if (!job) return false;
    try {
      await this.deliver({ to: job.recipient, subject: job.subject, body: job.body });
    } catch (error) {
      const code = errorCode(error);
      const status = job.attempts >= CONTACT_EMAIL_MAX_ATTEMPTS ? "FAILED" : "PENDING";
      const changed = await this.db.contactEmailJob.updateMany({
        where: { id: job.id, lockToken, status: "PROCESSING" },
        data: { status, nextAttemptAt: new Date(Date.now() + retryDelay(job.attempts)), lockedUntil: null, lockToken: null, lastError: code },
      });
      if (changed.count) console.warn("Contact email delivery deferred", { jobId: job.id, status, attempt: job.attempts, code });
      return true;
    }
    // A failed acknowledgement leaves the lease intact for recovery. Do not
    // reinterpret a DB failure as a confirmed failed SMTP send.
    await this.db.contactEmailJob.updateMany({
      where: { id: job.id, lockToken, status: "PROCESSING" },
      data: { status: "SENT", sentAt: new Date(), lockedUntil: null, lockToken: null, lastError: null },
    });
    return true;
  }
}

export function startContactEmailWorker(): () => void {
  if (process.env.CONTACT_EMAIL_WORKER_ENABLED === "false") return () => {};
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Contact email worker paused: EMAIL_USER and EMAIL_PASS are required. Saved jobs remain queued.");
    return () => {};
  }
  const worker = new ContactEmailWorker();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const poll = async () => {
    let delay = 5_000;
    try { if (await worker.runOnce()) delay = 100; }
    catch { console.error("Contact email worker could not process its queue; it will retry."); }
    if (!stopped) { timer = setTimeout(poll, delay); timer.unref(); }
  };
  timer = setTimeout(poll, 1_000);
  timer.unref();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}
