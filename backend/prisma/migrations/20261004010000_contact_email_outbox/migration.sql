-- CreateEnum
CREATE TYPE "ContactEmailKind" AS ENUM ('ADMIN', 'SENDER', 'AGENT');

-- CreateEnum
CREATE TYPE "ContactEmailStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ContactEmailJob" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "kind" "ContactEmailKind" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ContactEmailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "lockToken" TEXT,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactEmailJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactEmailJob_status_nextAttemptAt_idx" ON "ContactEmailJob"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ContactEmailJob_status_lockedUntil_idx" ON "ContactEmailJob"("status", "lockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "ContactEmailJob_contactId_kind_key" ON "ContactEmailJob"("contactId", "kind");

-- AddForeignKey
ALTER TABLE "ContactEmailJob" ADD CONSTRAINT "ContactEmailJob_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

