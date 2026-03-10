-- T-122: Telegram notify + Email fallback (Eskiz.uz SMS o'rniga)
-- ─────────────────────────────────────────────────────────────

-- 1. users: telegram_chat_id ustuni
ALTER TABLE "users" ADD COLUMN "telegram_chat_id" TEXT;

-- 2. customers: telegram_chat_id ustuni
ALTER TABLE "customers" ADD COLUMN "telegram_chat_id" TEXT;

-- 3. TelegramLinkToken jadvali
CREATE TABLE "telegram_link_tokens" (
    "id"          TEXT NOT NULL,
    "token"       TEXT NOT NULL,
    "user_id"     TEXT,
    "customer_id" TEXT,
    "tenant_id"   TEXT NOT NULL,
    "expires_at"  TIMESTAMP(3) NOT NULL,
    "used_at"     TIMESTAMP(3),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "telegram_link_tokens_token_key" ON "telegram_link_tokens"("token");
CREATE INDEX "telegram_link_tokens_token_idx" ON "telegram_link_tokens"("token");
CREATE INDEX "telegram_link_tokens_tenant_id_idx" ON "telegram_link_tokens"("tenant_id");

ALTER TABLE "telegram_link_tokens"
    ADD CONSTRAINT "telegram_link_tokens_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
