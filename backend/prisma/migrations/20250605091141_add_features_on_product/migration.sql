/*
  Warnings:

  - Added the required column `teaser` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "model" TEXT,
ADD COLUMN     "teaser" TEXT NOT NULL,
ADD COLUMN     "warranty" TEXT;
