-- T-122: Add telegram_chat_id to customers
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "telegram_chat_id" VARCHAR;

-- T-122: Create telegram_link_tokens table
CREATE TABLE IF NOT EXISTS "telegram_link_tokens" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT         NOT NULL,
    "user_id"     TEXT,
    "customer_id" TEXT,
    "token"       TEXT         NOT NULL,
    "expires_at"  TIMESTAMP(3) NOT NULL,
    "used_at"     TIMESTAMP(3),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "telegram_link_tokens_token_key" ON "telegram_link_tokens"("token");
CREATE INDEX IF NOT EXISTS "telegram_link_tokens_token_idx"     ON "telegram_link_tokens"("token");
CREATE INDEX IF NOT EXISTS "telegram_link_tokens_tenant_id_idx" ON "telegram_link_tokens"("tenant_id");

ALTER TABLE "telegram_link_tokens"
    ADD CONSTRAINT "telegram_link_tokens_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "telegram_link_tokens"
    ADD CONSTRAINT "telegram_link_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "telegram_link_tokens"
    ADD CONSTRAINT "telegram_link_tokens_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Make product_certificates columns optional (schema uses String?)
ALTER TABLE "product_certificates"
    ALTER COLUMN "issuing_authority" DROP NOT NULL,
    ALTER COLUMN "issued_at"         DROP NOT NULL;
