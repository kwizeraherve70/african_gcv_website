/*
  Warnings:

  - You are about to drop the column `mobileMoneyNumber` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mobileMoneyProvider` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `accountNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'AIRTEL_MONEY';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "mobileMoneyNumber",
DROP COLUMN "mobileMoneyProvider",
DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "accountProvider" TEXT,
ADD COLUMN     "refId" TEXT;
