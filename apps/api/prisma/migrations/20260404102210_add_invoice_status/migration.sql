/*
  Warnings:

  - The primary key for the `product_certificates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `promotions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "product_certificates_tenant_expires_idx";

-- DropIndex
DROP INDEX "product_certificates_tenant_product_idx";

-- DropIndex
DROP INDEX "promotions_tenant_dates_idx";

-- AlterTable
ALTER TABLE "product_certificates" DROP CONSTRAINT "product_certificates_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "issued_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "product_certificates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "promotions" DROP CONSTRAINT "promotions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ticket_messages" ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "product_certificates_expires_at_idx" ON "product_certificates"("expires_at");
