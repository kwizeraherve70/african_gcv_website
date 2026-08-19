-- Add Product.slug, needed by Day 3 frontend wiring (the frontend already
-- routes product detail pages by slug). Added as nullable first, backfilled
-- from `name` (falling back to the row's id if `name` slugifies to empty),
-- then locked to NOT NULL + UNIQUE — this is defensive for a database that
-- already has Product rows in it, even though this project's own local dev
-- database is currently empty; a bare `ADD COLUMN ... NOT NULL` with no
-- default would fail outright on any non-empty table.
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

UPDATE "Product"
SET "slug" = COALESCE(
  NULLIF(regexp_replace(lower(trim("name")), '[^a-z0-9]+', '-', 'g'), ''),
  'product'
) || '-' || substring("id" from 1 for 8)
WHERE "slug" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
