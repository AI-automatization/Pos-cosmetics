-- T-131: Add bot_settings column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bot_settings" JSONB;
