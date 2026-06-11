-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "adetal_visible" BOOLEAN NOT NULL DEFAULT false;
