-- T-395: Payment webhook idempotency
CREATE TABLE "payment_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_tx_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "action" TEXT,
    "payload" JSONB,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for idempotency
CREATE UNIQUE INDEX "payment_webhook_events_provider_external_tx_id_key" ON "payment_webhook_events"("provider", "external_tx_id");
CREATE INDEX "payment_webhook_events_tenant_id_idx" ON "payment_webhook_events"("tenant_id");
