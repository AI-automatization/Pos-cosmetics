-- CreateEnum
CREATE TYPE "BillingPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BillingProvider" AS ENUM ('PAYME', 'CLICK', 'UZUM');

-- CreateEnum
CREATE TYPE "AiWorkflowStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'HEALING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiTaskStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AiTokenLedgerType" AS ENUM ('ALLOCATION', 'CONSUMPTION', 'REFUND');

-- CreateEnum
CREATE TYPE "AiMemoryScope" AS ENUM ('WORKSPACE', 'WORKFLOW', 'USER', 'LONG_TERM', 'ENGINEERING');

-- CreateEnum
CREATE TYPE "AiIncidentSeverity" AS ENUM ('P0', 'P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "AiHealingStatus" AS ENUM ('PENDING', 'HEALING', 'RESOLVED', 'FAILED', 'ESCALATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PENDING';
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "zzone_visible" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year_from" INTEGER NOT NULL,
    "year_to" INTEGER,
    "body_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_vehicle_compatibilities" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_vehicle_compatibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "months" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(15,2) NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "status" "BillingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider_tx_id" TEXT,
    "checkout_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plan_slug" TEXT NOT NULL,
    "months" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(15,2) NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "company_name" TEXT,
    "company_stir" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AiWorkflowStatus" NOT NULL DEFAULT 'PENDING',
    "auto_mode" BOOLEAN NOT NULL DEFAULT false,
    "triggered_by" TEXT,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "model_used" TEXT,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "checkpoint_data" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL,
    "status" "AiTaskStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "model_used" TEXT,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_token_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "workflow_id" TEXT,
    "task_id" TEXT,
    "type" "AiTokenLedgerType" NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "cost_usd" DECIMAL(10,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_token_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_memories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "scope" "AiMemoryScope" NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "last_accessed" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_incidents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "workflow_id" TEXT,
    "severity" "AiIncidentSeverity" NOT NULL,
    "root_cause" TEXT,
    "healing_plan" TEXT,
    "healing_status" "AiHealingStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "workflow_id" TEXT,
    "task_id" TEXT,
    "action" TEXT NOT NULL,
    "agent_type" TEXT,
    "model" TEXT,
    "tokens_used" INTEGER,
    "user_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_health" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "is_healthy" BOOLEAN NOT NULL DEFAULT true,
    "latency_ms" INTEGER,
    "error_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_provider_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicles_brand_idx" ON "vehicles"("brand");

-- CreateIndex
CREATE INDEX "vehicles_brand_model_idx" ON "vehicles"("brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_brand_model_year_from_key" ON "vehicles"("brand", "model", "year_from");

-- CreateIndex
CREATE INDEX "product_vehicle_compatibilities_vehicle_id_idx" ON "product_vehicle_compatibilities"("vehicle_id");

-- CreateIndex
CREATE INDEX "product_vehicle_compatibilities_product_id_idx" ON "product_vehicle_compatibilities"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_vehicle_compatibilities_product_id_vehicle_id_key" ON "product_vehicle_compatibilities"("product_id", "vehicle_id");

-- CreateIndex
CREATE INDEX "billing_payments_tenant_id_idx" ON "billing_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "billing_payments_status_idx" ON "billing_payments"("status");

-- CreateIndex
CREATE INDEX "billing_payments_provider_tx_id_idx" ON "billing_payments"("provider_tx_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoices_invoice_number_key" ON "billing_invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoices_payment_id_key" ON "billing_invoices"("payment_id");

-- CreateIndex
CREATE INDEX "billing_invoices_tenant_id_idx" ON "billing_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "billing_invoices_issued_at_idx" ON "billing_invoices"("issued_at");

-- CreateIndex
CREATE INDEX "ai_workflows_tenant_id_status_idx" ON "ai_workflows"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "ai_workflows_tenant_id_created_at_idx" ON "ai_workflows"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_tasks_tenant_id_workflow_id_idx" ON "ai_tasks"("tenant_id", "workflow_id");

-- CreateIndex
CREATE INDEX "ai_tasks_tenant_id_agent_type_status_idx" ON "ai_tasks"("tenant_id", "agent_type", "status");

-- CreateIndex
CREATE INDEX "ai_token_ledger_tenant_id_created_at_idx" ON "ai_token_ledger"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_token_ledger_tenant_id_workflow_id_idx" ON "ai_token_ledger"("tenant_id", "workflow_id");

-- CreateIndex
CREATE INDEX "ai_memories_tenant_id_scope_idx" ON "ai_memories"("tenant_id", "scope");

-- CreateIndex
CREATE INDEX "ai_memories_tenant_id_relevance_idx" ON "ai_memories"("tenant_id", "relevance");

-- CreateIndex
CREATE UNIQUE INDEX "ai_memories_tenant_id_scope_key_key" ON "ai_memories"("tenant_id", "scope", "key");

-- CreateIndex
CREATE INDEX "ai_prompts_tenant_id_name_is_active_idx" ON "ai_prompts"("tenant_id", "name", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompts_tenant_id_name_version_key" ON "ai_prompts"("tenant_id", "name", "version");

-- CreateIndex
CREATE INDEX "ai_incidents_tenant_id_healing_status_idx" ON "ai_incidents"("tenant_id", "healing_status");

-- CreateIndex
CREATE INDEX "ai_incidents_tenant_id_created_at_idx" ON "ai_incidents"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_audit_logs_tenant_id_created_at_idx" ON "ai_audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_audit_logs_tenant_id_action_idx" ON "ai_audit_logs"("tenant_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_health_provider_model_key" ON "ai_provider_health"("provider", "model");

-- CreateIndex
CREATE INDEX "integration_configs_tenant_id_idx" ON "integration_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configs_tenant_id_provider_key" ON "integration_configs"("tenant_id", "provider");

-- AddForeignKey
ALTER TABLE "product_vehicle_compatibilities" ADD CONSTRAINT "product_vehicle_compatibilities_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_vehicle_compatibilities" ADD CONSTRAINT "product_vehicle_compatibilities_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_payments" ADD CONSTRAINT "billing_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_payments" ADD CONSTRAINT "billing_payments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "billing_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_ledger" ADD CONSTRAINT "ai_token_ledger_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "ai_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_incidents" ADD CONSTRAINT "ai_incidents_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "ai_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
