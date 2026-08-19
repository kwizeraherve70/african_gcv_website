-- Rename Role enum values to match this project's role model
-- (AGENT -> MERCHANT, CLIENT -> MEMBER). Uses RENAME VALUE rather than
-- Prisma's default drop-and-recreate-type diff, since this backend was a
-- real, previously-deployed app and may have existing rows using the old
-- enum labels — RENAME VALUE relabels those rows in place instead of
-- requiring a cast that would fail for any row still on the old values.
ALTER TYPE "Role" RENAME VALUE 'AGENT' TO 'MERCHANT';
ALTER TYPE "Role" RENAME VALUE 'CLIENT' TO 'MEMBER';

-- Add merchant ownership to Product (nullable: admin-created/seeded
-- products have no owning merchant; only merchant-created listings set this).
ALTER TABLE "Product" ADD COLUMN "merchantId" TEXT;

ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
