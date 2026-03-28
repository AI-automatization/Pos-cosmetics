-- T-305: Support CRM — SupportTicket + TicketMessage tables
-- Migration: 20260328000000_add_support_tickets

-- Enums
DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TicketSenderType" AS ENUM ('USER', 'SUPPORT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- SupportTicket table
CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"   TEXT NOT NULL,
  "user_id"     TEXT NOT NULL,
  "subject"     TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status"      "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "priority"    "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- TicketMessage table
CREATE TABLE IF NOT EXISTS "ticket_messages" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "ticket_id"   TEXT NOT NULL,
  "sender_type" "TicketSenderType" NOT NULL,
  "sender_id"   TEXT,
  "message"     TEXT NOT NULL,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- Foreign key: ticket_messages -> support_tickets
ALTER TABLE "ticket_messages"
  ADD CONSTRAINT "ticket_messages_ticket_id_fkey"
  FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "support_tickets_tenant_id_idx" ON "support_tickets"("tenant_id");
CREATE INDEX IF NOT EXISTS "support_tickets_tenant_id_status_idx" ON "support_tickets"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "support_tickets_user_id_idx" ON "support_tickets"("user_id");
CREATE INDEX IF NOT EXISTS "ticket_messages_ticket_id_idx" ON "ticket_messages"("ticket_id");
