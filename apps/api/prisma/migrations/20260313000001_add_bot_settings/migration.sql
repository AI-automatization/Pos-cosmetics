-- Add bot_settings JSONB column to users table
-- Used by Telegram bot for per-user notification preferences
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bot_settings" JSONB;

-- Add telegram_chat_id to users table (T-122)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_chat_id" VARCHAR;
