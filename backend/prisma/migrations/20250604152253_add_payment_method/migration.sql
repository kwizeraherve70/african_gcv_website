-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MTN_MOBILE_MONEY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'SUCCEEDED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELED';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "mobileMoneyNumber" TEXT,
ADD COLUMN     "mobileMoneyProvider" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;
