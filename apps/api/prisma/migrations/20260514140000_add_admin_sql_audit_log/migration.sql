-- T-387: Super Admin SQL console audit log (immutable)
CREATE TABLE "admin_sql_audit_log" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "sql_type" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sql_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_sql_audit_log_admin_id_idx" ON "admin_sql_audit_log"("admin_id");
CREATE INDEX "admin_sql_audit_log_executed_at_idx" ON "admin_sql_audit_log"("executed_at");
