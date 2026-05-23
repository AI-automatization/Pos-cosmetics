-- T-393: Payme transaction tracking
CREATE TABLE "payme_transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payme_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_intent_id" TEXT,
    "amount" INTEGER NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 1,
    "reason" INTEGER,
    "create_time" BIGINT NOT NULL,
    "perform_time" BIGINT,
    "cancel_time" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payme_transactions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "payme_transactions_payme_id_key" ON "payme_transactions"("payme_id");
CREATE INDEX "payme_transactions_tenant_id_idx" ON "payme_transactions"("tenant_id");
CREATE INDEX "payme_transactions_order_id_idx" ON "payme_transactions"("order_id");

-- Foreign keys
ALTER TABLE "payme_transactions" ADD CONSTRAINT "payme_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payme_transactions" ADD CONSTRAINT "payme_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
