-- Add TelegramLinkToken table (T-122)
CREATE TABLE IF NOT EXISTS "telegram_link_tokens" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"   TEXT NOT NULL,
  "token"       TEXT NOT NULL UNIQUE,
  "user_id"     TEXT,
  "customer_id" TEXT,
  "expires_at"  TIMESTAMPTZ NOT NULL,
  "used_at"     TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "telegram_link_tokens_token_idx" ON "telegram_link_tokens" ("token");
CREATE INDEX IF NOT EXISTS "telegram_link_tokens_tenant_id_idx" ON "telegram_link_tokens" ("tenant_id");

-- Add telegramChatId to customers (T-122)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "telegram_chat_id" VARCHAR;

-- Add ProductCertificate table (T-097)
CREATE TABLE IF NOT EXISTS "product_certificates" (
  "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"        TEXT NOT NULL,
  "product_id"       TEXT NOT NULL,
  "cert_number"      TEXT NOT NULL,
  "issuing_authority" TEXT,
  "issued_at"        TIMESTAMPTZ NOT NULL,
  "expires_at"       TIMESTAMPTZ,
  "file_url"         TEXT,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "product_certificates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "product_certificates_tenant_id_idx" ON "product_certificates" ("tenant_id");
CREATE INDEX IF NOT EXISTS "product_certificates_product_id_idx" ON "product_certificates" ("product_id");

-- Add PromotionType enum and Promotion table (T-099)
DO $$ BEGIN
  CREATE TYPE "PromotionType" AS ENUM ('PERCENT', 'FIXED', 'BUY_X_GET_Y', 'BUNDLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "promotions" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"  TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "type"       "PromotionType" NOT NULL,
  "rules"      JSONB NOT NULL,
  "valid_from" TIMESTAMPTZ NOT NULL,
  "valid_to"   TIMESTAMPTZ,
  "is_active"  BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "promotions_tenant_id_idx" ON "promotions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "promotions_tenant_id_is_active_idx" ON "promotions" ("tenant_id", "is_active");
