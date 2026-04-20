-- T-078: Add isTaxable flag to products
-- Default true — barcha mavjud mahsulotlar soliq to'lashi kerak deb hisoblanadi
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_taxable" BOOLEAN NOT NULL DEFAULT true;
