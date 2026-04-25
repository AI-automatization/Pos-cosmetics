-- Database Audit Phase 1: Tenant Integrity & Schema Hardening (2026-04-21)
--
-- Fixes:
--   1. Add @@unique constraints with tenantId (Category, Unit, Supplier, Warehouse, Product)
--   2. Add FK relations to Tenant for orphan tables (EventLog, AuditLog, Expense, ReminderLog, ClientErrorLog)
--   3. Fix FeatureFlag tenantId: drop NOT NULL + default (null = global)
--   4. Add missing indexes (notifications, sync_outbox, client_error_logs)
--   5. SyncOutbox: add attempts + max_attempts columns
--   6. BotOtpToken table (was db-pushed, now in migration history)
--   7. ExpenseCategory.TESTER variant (was db-pushed, now in migration history)

-- AlterEnum
ALTER TYPE "ExpenseCategory" ADD VALUE IF NOT EXISTS 'TESTER';

-- DropIndex (replaced by UNIQUE constraints below)
DROP INDEX IF EXISTS "client_error_logs_tenant_id_occurred_at_idx";
DROP INDEX IF EXISTS "products_tenant_id_barcode_idx";
DROP INDEX IF EXISTS "products_tenant_id_sku_idx";
DROP INDEX IF EXISTS "suppliers_tenant_id_name_idx";

-- AlterTable: FeatureFlag tenantId nullable (null = global default)
ALTER TABLE "feature_flags" ALTER COLUMN "tenant_id" DROP NOT NULL,
ALTER COLUMN "tenant_id" DROP DEFAULT;
UPDATE "feature_flags" SET "tenant_id" = NULL WHERE "tenant_id" = '';

-- AlterTable: SyncOutbox retry tracking
ALTER TABLE "sync_outbox" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "max_attempts" INTEGER NOT NULL DEFAULT 3;

-- CreateTable: BotOtpToken (previously db-pushed)
CREATE TABLE IF NOT EXISTS "bot_otp_tokens" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "bot_settings" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bot_otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: BotOtpToken
CREATE INDEX IF NOT EXISTS "bot_otp_tokens_chat_id_idx" ON "bot_otp_tokens"("chat_id");
CREATE INDEX IF NOT EXISTS "bot_otp_tokens_tenant_id_idx" ON "bot_otp_tokens"("tenant_id");

-- Deduplicate existing data before adding UNIQUE constraints
-- Append _DUP_{n} suffix to older duplicate SKUs (keep newest)
UPDATE "products" p SET sku = sku || '_DUP_' || p.id
WHERE sku IS NOT NULL AND p.id NOT IN (
  SELECT DISTINCT ON (tenant_id, sku) id
  FROM "products" WHERE sku IS NOT NULL
  ORDER BY tenant_id, sku, created_at DESC
);

-- Same for barcodes
UPDATE "products" p SET barcode = barcode || '_DUP_' || p.id
WHERE barcode IS NOT NULL AND p.id NOT IN (
  SELECT DISTINCT ON (tenant_id, barcode) id
  FROM "products" WHERE barcode IS NOT NULL
  ORDER BY tenant_id, barcode, created_at DESC
);

-- Unique constraints: multi-tenant data integrity
CREATE UNIQUE INDEX IF NOT EXISTS "categories_tenant_id_name_parent_id_key" ON "categories"("tenant_id", "name", "parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "units_tenant_id_short_name_key" ON "units"("tenant_id", "short_name");
CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_tenant_id_name_key" ON "suppliers"("tenant_id", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "warehouses_tenant_id_name_key" ON "warehouses"("tenant_id", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "products_tenant_id_sku_key" ON "products"("tenant_id", "sku");
CREATE UNIQUE INDEX IF NOT EXISTS "products_tenant_id_barcode_key" ON "products"("tenant_id", "barcode");

-- Performance indexes
CREATE INDEX IF NOT EXISTS "client_error_logs_tenant_id_severity_occurred_at_idx" ON "client_error_logs"("tenant_id", "severity", "occurred_at");
CREATE INDEX IF NOT EXISTS "notifications_tenant_id_is_read_idx" ON "notifications"("tenant_id", "is_read");
CREATE INDEX IF NOT EXISTS "sync_outbox_status_created_at_idx" ON "sync_outbox"("status", "created_at");

-- FK: Tenant relations for orphan tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_log_tenant_id_fkey') THEN
    ALTER TABLE "event_log" ADD CONSTRAINT "event_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_tenant_id_fkey') THEN
    ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_tenant_id_fkey') THEN
    ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_logs_tenant_id_fkey') THEN
    ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_error_logs_tenant_id_fkey') THEN
    ALTER TABLE "client_error_logs" ADD CONSTRAINT "client_error_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
