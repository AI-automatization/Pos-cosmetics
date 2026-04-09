-- CreateTable: warehouse_invoices + warehouse_invoice_items
-- T-344: Missing migration for WarehouseInvoice model

CREATE TABLE IF NOT EXISTS "warehouse_invoices" (
    "id"             TEXT         NOT NULL,
    "tenant_id"      TEXT         NOT NULL,
    "branch_id"      TEXT,
    "supplier_id"    TEXT,
    "invoice_number" TEXT,
    "note"           TEXT,
    "total_cost"     DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_by"     TEXT         NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "warehouse_invoice_items" (
    "id"             TEXT          NOT NULL,
    "invoice_id"     TEXT          NOT NULL,
    "product_id"     TEXT          NOT NULL,
    "quantity"       INTEGER       NOT NULL,
    "purchase_price" DECIMAL(15,2) NOT NULL,
    "total_cost"     DECIMAL(15,2) NOT NULL,
    "warehouse_id"   TEXT,
    "batch_number"   TEXT,
    "expiry_date"    TIMESTAMP(3),

    CONSTRAINT "warehouse_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "warehouse_invoices_tenant_id_idx"             ON "warehouse_invoices"("tenant_id");
CREATE INDEX IF NOT EXISTS "warehouse_invoices_tenant_id_created_at_idx"  ON "warehouse_invoices"("tenant_id", "created_at");
CREATE INDEX IF NOT EXISTS "warehouse_invoices_tenant_id_supplier_id_idx" ON "warehouse_invoices"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "warehouse_invoice_items_invoice_id_idx"       ON "warehouse_invoice_items"("invoice_id");
CREATE INDEX IF NOT EXISTS "warehouse_invoice_items_product_id_idx"       ON "warehouse_invoice_items"("product_id");

-- AddForeignKey
ALTER TABLE "warehouse_invoice_items"
    ADD CONSTRAINT "warehouse_invoice_items_invoice_id_fkey"
    FOREIGN KEY ("invoice_id") REFERENCES "warehouse_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
