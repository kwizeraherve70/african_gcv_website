/*
  Warnings:

  - You are about to drop the column `features_eight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_five` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_four` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_nine` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_one` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_seven` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_six` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_ten` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_three` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `features_two` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "features_eight",
DROP COLUMN "features_five",
DROP COLUMN "features_four",
DROP COLUMN "features_nine",
DROP COLUMN "features_one",
DROP COLUMN "features_seven",
DROP COLUMN "features_six",
DROP COLUMN "features_ten",
DROP COLUMN "features_three",
DROP COLUMN "features_two",
ADD COLUMN     "featuresEight" TEXT,
ADD COLUMN     "featuresFive" TEXT,
ADD COLUMN     "featuresFix" TEXT,
ADD COLUMN     "featuresFour" TEXT,
ADD COLUMN     "featuresNine" TEXT,
ADD COLUMN     "featuresOne" TEXT,
ADD COLUMN     "featuresSeven" TEXT,
ADD COLUMN     "featuresTen" TEXT,
ADD COLUMN     "featuresThree" TEXT,
ADD COLUMN     "featuresTwo" TEXT;
