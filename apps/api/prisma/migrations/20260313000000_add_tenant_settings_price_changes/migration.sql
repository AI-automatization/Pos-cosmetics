-- T-132: Tenant Settings table
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "language" TEXT NOT NULL DEFAULT 'uz',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tashkent',
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "receipt_header" TEXT,
    "receipt_footer" TEXT,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "expiry_alert_days" INTEGER NOT NULL DEFAULT 30,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- T-133: Price Changes (history) table
CREATE TABLE "price_changes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT,
    "field" TEXT NOT NULL,
    "old_value" DECIMAL(15,2) NOT NULL,
    "new_value" DECIMAL(15,2) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_changes_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on tenant_settings
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- Indexes for price_changes
CREATE INDEX "price_changes_tenant_id_idx" ON "price_changes"("tenant_id");
CREATE INDEX "price_changes_product_id_idx" ON "price_changes"("product_id");
CREATE INDEX "price_changes_tenant_id_created_at_idx" ON "price_changes"("tenant_id", "created_at");

-- Foreign Keys
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "price_changes" ADD CONSTRAINT "price_changes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "price_changes" ADD CONSTRAINT "price_changes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
