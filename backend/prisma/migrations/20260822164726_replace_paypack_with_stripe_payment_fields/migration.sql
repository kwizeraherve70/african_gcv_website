/*
  Warnings:

  - You are about to drop the column `kind` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "kind",
ALTER COLUMN "accountNumber" DROP NOT NULL;
