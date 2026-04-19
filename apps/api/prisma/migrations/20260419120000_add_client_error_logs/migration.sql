-- CreateTable
CREATE TABLE "client_error_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "user_id" TEXT,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CLIENT',
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "url" VARCHAR(500),
    "user_agent" VARCHAR(500),
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_error_logs_tenant_id_idx" ON "client_error_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "client_error_logs_tenant_id_occurred_at_idx" ON "client_error_logs"("tenant_id", "occurred_at");

-- CreateIndex
CREATE INDEX "client_error_logs_severity_idx" ON "client_error_logs"("severity");

-- CreateIndex
CREATE INDEX "client_error_logs_occurred_at_idx" ON "client_error_logs"("occurred_at");
