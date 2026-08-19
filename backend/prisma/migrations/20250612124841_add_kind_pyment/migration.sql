/*
  Warnings:

  - Added the required column `kind` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "kind" TEXT NOT NULL;
