-- CreateEnum
CREATE TYPE "TeamSection" AS ENUM ('LEADERSHIP', 'FOUNDERS', 'DEPARTMENTS');

-- CreateEnum
CREATE TYPE "TeamTitleSource" AS ENUM ('PRIMARY', 'SECONDARY', 'CUSTOM', 'NONE');

-- CreateEnum
CREATE TYPE "TeamPhotoSource" AS ENUM ('CLOUDINARY_UPLOAD', 'EXTERNAL_URL');

-- CreateTable
CREATE TABLE "TeamPerson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "primaryTitle" JSONB NOT NULL,
    "secondaryTitle" JSONB NOT NULL,
    "profilePath" TEXT,
    "photoUrl" TEXT,
    "photoSource" "TeamPhotoSource",
    "cloudinaryPublicId" TEXT,
    "cloudinaryAssetId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPlacement" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "section" "TeamSection" NOT NULL,
    "departmentId" TEXT,
    "countryOverride" TEXT,
    "region" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "titleSource" "TeamTitleSource" NOT NULL DEFAULT 'PRIMARY',
    "secondaryTitleSource" "TeamTitleSource" NOT NULL DEFAULT 'NONE',
    "customTitle" JSONB NOT NULL,
    "customSecondaryTitle" JSONB NOT NULL,
    "bio" JSONB NOT NULL,

    CONSTRAINT "TeamPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamDepartment" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPageContent" (
    "id" TEXT NOT NULL DEFAULT 'team',
    "copy" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "directoryVersion" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamPerson_slug_key" ON "TeamPerson"("slug");

-- CreateIndex
CREATE INDEX "TeamPerson_published_slug_idx" ON "TeamPerson"("published", "slug");

-- CreateIndex
CREATE INDEX "TeamPlacement_section_sortOrder_id_idx" ON "TeamPlacement"("section", "sortOrder", "id");

-- CreateIndex
CREATE INDEX "TeamPlacement_departmentId_idx" ON "TeamPlacement"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlacement_personId_section_key" ON "TeamPlacement"("personId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "TeamDepartment_key_key" ON "TeamDepartment"("key");

-- CreateIndex
CREATE INDEX "TeamDepartment_sortOrder_id_idx" ON "TeamDepartment"("sortOrder", "id");

-- AddForeignKey
ALTER TABLE "TeamPlacement" ADD CONSTRAINT "TeamPlacement_personId_fkey" FOREIGN KEY ("personId") REFERENCES "TeamPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlacement" ADD CONSTRAINT "TeamPlacement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "TeamDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Initialize the singleton required by every atomic directory write.
INSERT INTO "TeamPageContent" ("id", "copy", "version", "directoryVersion", "updatedAt")
VALUES ('team', '{"heroBadge":{"en":"The People Behind the Movement"},"heroTitle":{"en":"GCV Core Team"},"heroSubtitle":{"en":"Meet the leaders building the global GCV community."},"leadershipEyebrow":{"en":"Global Leadership"},"leadershipTitle":{"en":"Global Leadership"},"foundersEyebrow":{"en":"Our Founders"},"foundersTitle":{"en":"GCV Founders"},"departmentsEyebrow":{"en":"Our Structure"},"departmentsTitle":{"en":"Department Teams"},"seoTitle":{"en":"GCV Core Team"},"seoDescription":{"en":"Meet the GCV leaders, founders and department teams."}}'::jsonb, 1, 0, CURRENT_TIMESTAMP);
