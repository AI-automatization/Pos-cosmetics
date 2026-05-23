-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "provider" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status_code" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "retries_left" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_logs_provider_success_retries_left_idx" ON "webhook_logs"("provider", "success", "retries_left");

-- CreateIndex
CREATE INDEX "webhook_logs_tenant_id_idx" ON "webhook_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "webhook_logs_created_at_idx" ON "webhook_logs"("created_at");
