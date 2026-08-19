/*
  Warnings:

  - You are about to drop the column `discountPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "discountPrice",
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
