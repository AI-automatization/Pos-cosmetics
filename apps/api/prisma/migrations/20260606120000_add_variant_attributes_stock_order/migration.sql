-- T-432: Product Variant Matrix — attributes, variant-level stock & orders

-- 1. Add JSON attributes to product_variants
ALTER TABLE "product_variants" ADD COLUMN "attributes" JSONB NOT NULL DEFAULT '{}';

-- 2. Add variant_id to stock_movements (optional, for variant-level stock tracking)
ALTER TABLE "stock_movements" ADD COLUMN "variant_id" TEXT;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey"
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "stock_movements_tenant_id_product_id_variant_id_idx"
  ON "stock_movements"("tenant_id", "product_id", "variant_id");

-- 3. Add variant_id + variant_name to order_items (optional, snapshot for receipt)
ALTER TABLE "order_items" ADD COLUMN "variant_id" TEXT;
ALTER TABLE "order_items" ADD COLUMN "variant_name" TEXT;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey"
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
