-- CreateEnum
CREATE TYPE "PaymentProviderType" AS ENUM ('TERMINAL', 'PAYME', 'CLICK', 'UZUM');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'UZUM';

-- CreateTable
CREATE TABLE "payment_provider_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" "PaymentProviderType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "encrypted_credentials" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_provider_configs_tenant_id_idx" ON "payment_provider_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_configs_tenant_id_provider_key" ON "payment_provider_configs"("tenant_id", "provider");

-- AddForeignKey
ALTER TABLE "payment_provider_configs" ADD CONSTRAINT "payment_provider_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
