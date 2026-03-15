-- 20260315000001: Fix telegram_link_tokens FKs + product_certificates nullable columns

-- 1. telegram_link_tokens: add user_id and customer_id FK constraints (missed in 20260309)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'telegram_link_tokens_user_id_fkey'
  ) THEN
    ALTER TABLE "telegram_link_tokens"
      ADD CONSTRAINT "telegram_link_tokens_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'telegram_link_tokens_customer_id_fkey'
  ) THEN
    ALTER TABLE "telegram_link_tokens"
      ADD CONSTRAINT "telegram_link_tokens_customer_id_fkey"
      FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. product_certificates: make issuing_authority and issued_at nullable (schema uses String?)
ALTER TABLE "product_certificates"
  ALTER COLUMN "issuing_authority" DROP NOT NULL;

ALTER TABLE "product_certificates"
  ALTER COLUMN "issued_at" DROP NOT NULL;
