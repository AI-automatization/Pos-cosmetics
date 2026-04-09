-- B-038: Add tenant_id to warehouse_invoice_items and ticket_messages
-- Change WarehouseInvoiceItem.invoice onDelete: Cascade → Restrict

-- warehouse_invoice_items: add tenant_id (backfill from parent invoice)
ALTER TABLE "warehouse_invoice_items"
  ADD COLUMN "tenant_id" TEXT NOT NULL DEFAULT '';

UPDATE "warehouse_invoice_items" wii
SET "tenant_id" = wi."tenant_id"
FROM "warehouse_invoices" wi
WHERE wii."invoice_id" = wi."id";

ALTER TABLE "warehouse_invoice_items"
  ALTER COLUMN "tenant_id" DROP DEFAULT;

CREATE INDEX "warehouse_invoice_items_tenant_id_idx" ON "warehouse_invoice_items"("tenant_id");

-- warehouse_invoice_items: Cascade → Restrict
ALTER TABLE "warehouse_invoice_items"
  DROP CONSTRAINT IF EXISTS "warehouse_invoice_items_invoice_id_fkey";

ALTER TABLE "warehouse_invoice_items"
  ADD CONSTRAINT "warehouse_invoice_items_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "warehouse_invoices"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ticket_messages: add tenant_id (backfill from parent ticket)
ALTER TABLE "ticket_messages"
  ADD COLUMN "tenant_id" TEXT NOT NULL DEFAULT '';

UPDATE "ticket_messages" tm
SET "tenant_id" = st."tenant_id"
FROM "support_tickets" st
WHERE tm."ticket_id" = st."id";

ALTER TABLE "ticket_messages"
  ALTER COLUMN "tenant_id" DROP DEFAULT;

CREATE INDEX "ticket_messages_tenant_id_idx" ON "ticket_messages"("tenant_id");
