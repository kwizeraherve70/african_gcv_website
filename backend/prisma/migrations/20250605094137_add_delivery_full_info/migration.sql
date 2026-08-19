/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerNote` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Order` table. All the data in the column will be lost.
  - The `orderNumber` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `customerEmail` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerFirstName` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerLastName` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ProductCategory" ADD VALUE 'FASHION';

-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "phoneNumber",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerFirstName" TEXT NOT NULL,
ADD COLUMN     "customerLastName" TEXT NOT NULL,
ADD COLUMN     "customerNote" TEXT,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerEmail",
DROP COLUMN "customerName",
DROP COLUMN "customerNote",
DROP COLUMN "customerPhone",
ADD COLUMN     "deliveryFee" DOUBLE PRECISION,
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL,
DROP COLUMN "orderNumber",
ADD COLUMN     "orderNumber" SERIAL NOT NULL;
