-- T-096: Add TESTER to StockMovementType enum
ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'TESTER';

-- T-097: Product certificates
CREATE TABLE "product_certificates" (
    "id"                UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         TEXT NOT NULL,
    "product_id"        TEXT NOT NULL,
    "cert_number"       TEXT NOT NULL,
    "issuing_authority" TEXT NOT NULL,
    "issued_at"         DATE NOT NULL,
    "expires_at"        DATE,
    "file_url"          TEXT,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_certificates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_certificates_tenant_id_idx" ON "product_certificates"("tenant_id");
CREATE INDEX "product_certificates_tenant_product_idx" ON "product_certificates"("tenant_id", "product_id");
CREATE INDEX "product_certificates_tenant_expires_idx" ON "product_certificates"("tenant_id", "expires_at");

ALTER TABLE "product_certificates"
    ADD CONSTRAINT "product_certificates_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_certificates"
    ADD CONSTRAINT "product_certificates_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- T-099: PromotionType enum
CREATE TYPE "PromotionType" AS ENUM ('PERCENT', 'FIXED', 'BUY_X_GET_Y', 'BUNDLE');

-- T-099: Promotions table
CREATE TABLE "promotions" (
    "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "type"        "PromotionType" NOT NULL,
    "rules"       JSONB NOT NULL,
    "valid_from"  TIMESTAMP(3) NOT NULL,
    "valid_to"    TIMESTAMP(3),
    "is_active"   BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "promotions_tenant_id_idx" ON "promotions"("tenant_id");
CREATE INDEX "promotions_tenant_active_idx" ON "promotions"("tenant_id", "is_active");
CREATE INDEX "promotions_tenant_dates_idx" ON "promotions"("tenant_id", "valid_from", "valid_to");

ALTER TABLE "promotions"
    ADD CONSTRAINT "promotions_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
