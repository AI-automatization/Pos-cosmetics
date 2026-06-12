-- Performance indexes

-- Customer search with pagination (name + isActive)
CREATE INDEX IF NOT EXISTS "customers_tenant_id_is_active_name_idx"
  ON "customers" ("tenant_id", "is_active", "name");

-- Order items: report joins
CREATE INDEX IF NOT EXISTS "order_items_order_id_product_id_idx"
  ON "order_items" ("order_id", "product_id");
