/*
  Warnings:

  - You are about to drop the column `features` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "features",
ADD COLUMN     "features_eight" TEXT,
ADD COLUMN     "features_five" TEXT,
ADD COLUMN     "features_four" TEXT,
ADD COLUMN     "features_nine" TEXT,
ADD COLUMN     "features_one" TEXT,
ADD COLUMN     "features_seven" TEXT,
ADD COLUMN     "features_six" TEXT,
ADD COLUMN     "features_ten" TEXT,
ADD COLUMN     "features_three" TEXT,
ADD COLUMN     "features_two" TEXT;
