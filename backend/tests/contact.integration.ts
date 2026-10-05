import { test, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { RegisterRoutes } from "../build/routes";
import { prisma } from "../src/utils/client";
import * as email from "../src/utils/email";
import * as notifications from "../src/services/contactNotifications";
import { ContactEmailWorker, CONTACT_EMAIL_MAX_ATTEMPTS, retryDelay } from "../src/services/contactEmailWorker";
import { retryFailedContactEmail } from "../src/scripts/contactEmailJobs";

const database = new URL(process.env.DATABASE_URL || "postgresql://invalid/invalid");
if (!["127.0.0.1", "localhost"].includes(database.hostname) || !database.pathname.includes("gcv_contact_test")) throw new Error("Contact tests require an isolated localhost gcv_contact_test database");
const db = new PrismaClient();
let server: Server;
let base: string;
before(async () => {
  const app = express(); app.use(express.json()); RegisterRoutes(app);
  app.use((err: { status?: number }, _req: Request, res: Response, _next: NextFunction) => { res.status(err.status || 500).json({ message: "Request failed" }); });
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/contact`;
});
beforeEach(async () => { mock.restoreAll(); await db.contact.deleteMany(); });
after(async () => {
  mock.restoreAll(); await db.contact.deleteMany();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await Promise.all([db.$disconnect(), prisma.$disconnect()]);
});
async function submit(extra = {}) {
  return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Contact test", email: "visitor@example.invalid", message: "An isolated test enquiry", ...extra }), signal: AbortSignal.timeout(2000) });
}
async function singleJob() {
  const contact = await db.contact.create({ data: { name: "Worker test", email: "visitor@example.invalid", message: "isolated test" } });
  return db.contactEmailJob.create({ data: { contactId: contact.id, kind: "SENDER", recipient: contact.email, subject: "Test", body: "Test message" } });
}

test("HTTP contact receipt returns while SMTP is stalled; both notifications are durable", async () => {
  // The old handler hangs here until the request times out. The new handler
  // must not call the SMTP path at all, even when it can never complete.
  let calls = 0;
  mock.method(email, "sendEmailSafe", () => { calls++; return new Promise<boolean>(() => {}); });
  const started = Date.now(); const response = await submit();
  assert.equal(response.status, 201); assert(Date.now() - started < 1500);
  const contact = (await response.json()).data;
  assert.equal(calls, 0);
  const jobs = await db.contactEmailJob.findMany({ where: { contactId: contact.id }, orderBy: { kind: "asc" } });
  assert.deepEqual(jobs.map(job => job.kind), ["ADMIN", "SENDER"]);
  assert(jobs.every(job => job.status === "PENDING" && job.attempts === 0));
  assert.equal(await db.contact.count(), 1);
});

test("notification persistence failure rolls back the enquiry instead of acknowledging lost jobs", async () => {
  mock.method(notifications, "queueContactNotifications", async () => { throw new Error("DB write failed"); });
  assert.equal((await submit()).status, 500);
  assert.equal(await db.contact.count(), 0); assert.equal(await db.contactEmailJob.count(), 0);
});

test("independent workers cannot send the same active job concurrently", async () => {
  const job = await singleJob(); let sent = 0; let release!: () => void; let started!: () => void;
  const began = new Promise<void>(resolve => { started = resolve; });
  const hold = new Promise<void>(resolve => { release = resolve; });
  const deliver = async () => { sent++; started(); await hold; };
  const running = new ContactEmailWorker(db, deliver).runOnce(); await began;
  assert.equal(await new ContactEmailWorker(db, deliver).runOnce(), false);
  release(); assert.equal(await running, true);
  assert.equal(sent, 1); assert.equal((await db.contactEmailJob.findUniqueOrThrow({ where: { id: job.id } })).status, "SENT");
  assert.equal(await new ContactEmailWorker(db, deliver).runOnce(), false);
});

test("SMTP failures back off, preserve the enquiry, stop at the limit and can be explicitly retried", async () => {
  const job = await singleJob();
  const worker = new ContactEmailWorker(db, async () => { throw Object.assign(new Error("Private SMTP details must not be persisted"), { code: "ETIMEDOUT" }); });
  for (let attempt = 1; attempt <= CONTACT_EMAIL_MAX_ATTEMPTS; attempt++) {
    const start = Date.now(); assert.equal(await worker.runOnce(), true);
    const current = await db.contactEmailJob.findUniqueOrThrow({ where: { id: job.id } });
    assert.equal(current.attempts, attempt); assert.equal(current.lastError, "ETIMEDOUT");
    assert.equal(current.status, attempt === CONTACT_EMAIL_MAX_ATTEMPTS ? "FAILED" : "PENDING");
    assert(current.nextAttemptAt.getTime() >= start + retryDelay(attempt));
    assert.equal(await worker.runOnce(), false);
    if (current.status === "PENDING") await db.contactEmailJob.update({ where: { id: job.id }, data: { nextAttemptAt: new Date(0) } });
  }
  assert.equal(await db.contact.count(), 1);
  assert.equal(await retryFailedContactEmail(db, job.id), true);
  assert.equal(await new ContactEmailWorker(db, async () => {}).runOnce(), true);
  assert.equal((await db.contactEmailJob.findUniqueOrThrow({ where: { id: job.id } })).status, "SENT");
  assert.equal(await retryFailedContactEmail(db, job.id), false);
});

test("expired leases recover after restart and stale workers cannot acknowledge the new claim", async () => {
  const job = await singleJob(); const staleToken = "stale-worker-token";
  await db.contactEmailJob.update({ where: { id: job.id }, data: { status: "PROCESSING", attempts: 1, lockToken: staleToken, lockedUntil: new Date(0) } });
  const worker = new ContactEmailWorker(db, async () => {
    const changed = await db.contactEmailJob.updateMany({ where: { id: job.id, lockToken: staleToken }, data: { status: "SENT" } });
    assert.equal(changed.count, 0);
  });
  assert.equal(await worker.runOnce(), true);
  const saved = await db.contactEmailJob.findUniqueOrThrow({ where: { id: job.id } });
  assert.equal(saved.status, "SENT"); assert.equal(saved.attempts, 2);
});

test("a crash on the final attempt becomes a retained failed job, not a stranded lease", async () => {
  const job = await singleJob();
  await db.contactEmailJob.update({ where: { id: job.id }, data: { status: "PROCESSING", attempts: CONTACT_EMAIL_MAX_ATTEMPTS, lockToken: "expired", lockedUntil: new Date(0) } });
  assert.equal(await new ContactEmailWorker(db, async () => { assert.fail("Must not send exhausted jobs"); }).runOnce(), false);
  const saved = await db.contactEmailJob.findUniqueOrThrow({ where: { id: job.id } });
  assert.equal(saved.status, "FAILED"); assert.equal(saved.lastError, "DELIVERY_OUTCOME_UNKNOWN");
});

test("deleting an enquiry removes its unsent notifications", async () => {
  const response = await submit(); assert.equal(response.status, 201); const contact = (await response.json()).data;
  await db.contact.delete({ where: { id: contact.id } });
  assert.equal(await db.contactEmailJob.count(), 0);
  assert.equal(await new ContactEmailWorker(db, async () => { assert.fail("Deleted contact must not be sent"); }).runOnce(), false);
});

test("member and repeat agent enquiries retain their existing notification routing", async () => {
  const user = await db.user.create({ data: { firstName: "Local", lastName: "Member", email: `contact-${Date.now()}@example.invalid`, password: "not-a-login-password" } });
  const agent = await db.agents.create({ data: { userId: user.id, description: "Test", experience: "Test", speciality: [], whatsapp: "test", joined: "test", languages: "test", about: "test" } });
  try {
    const member = await submit({ userId: user.id }); assert.equal(member.status, 201);
    const memberContact = (await member.json()).data; assert.equal(memberContact.email, user.email);
    assert.equal(await db.contactEmailJob.count({ where: { contactId: memberContact.id } }), 2);
    for (let i = 0; i < 2; i++) {
      const response = await submit({ agentId: agent.id }); assert.equal(response.status, 201);
      const contact = (await response.json()).data;
      const jobs = await db.contactEmailJob.findMany({ where: { contactId: contact.id } });
      assert.equal(jobs.length, 1); assert.equal(jobs[0].kind, "AGENT"); assert.equal(jobs[0].recipient, user.email);
    }
  } finally { await db.contact.deleteMany(); await db.enquiryProperty.deleteMany(); await db.agents.delete({ where: { id: agent.id } }); await db.user.delete({ where: { id: user.id } }); }
});

test("a stalled SMTP operation is closed at its total deadline", async () => {
  let closed = 0;
  mock.method(nodemailer, "createTransport", () => ({ sendMail: () => new Promise(() => {}), close: () => { closed++; } }) as unknown as ReturnType<typeof nodemailer.createTransport>);
  await assert.rejects(email.sendEmailBounded({ to: "test@example.invalid", subject: "Test", body: "Test" }, 25), { code: "ETIMEDOUT" });
  assert(closed > 0);
});
