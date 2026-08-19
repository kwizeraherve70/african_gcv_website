-- Swap ProductCategory from the general-retail enum inherited from khm-be
-- to the car-dealership catalog confirmed as this project's permanent
-- direction (2026-08-16). This is a genuine domain swap, not a rename —
-- there is no sensible mapping from e.g. WOMENS_FASHION to a car category,
-- so any existing Product row on the old enum values will fail this cast
-- and must be re-seeded, not silently reinterpreted.
BEGIN;
CREATE TYPE "ProductCategory_new" AS ENUM ('SEDANS', 'SUVS', 'SPORTS_CARS', 'LUXURY');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "ProductCategory_new" USING ("category"::text::"ProductCategory_new");
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "ProductCategory_old";
COMMIT;
