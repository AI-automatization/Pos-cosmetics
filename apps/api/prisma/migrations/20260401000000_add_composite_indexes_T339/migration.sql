-- T-339: Add composite indexes for tenant isolation queries
-- warehouse_invoice_items: [tenant_id, invoice_id] — range queries by tenant+invoice
-- ticket_messages: [tenant_id, ticket_id] — range queries by tenant+ticket

CREATE INDEX "warehouse_invoice_items_tenant_id_invoice_id_idx"
  ON "warehouse_invoice_items"("tenant_id", "invoice_id");

CREATE INDEX "ticket_messages_tenant_id_ticket_id_idx"
  ON "ticket_messages"("tenant_id", "ticket_id");
