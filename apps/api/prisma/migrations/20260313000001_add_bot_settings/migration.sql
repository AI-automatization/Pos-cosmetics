-- Add bot_settings JSONB column to users table
-- Used by Telegram bot for per-user notification preferences
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bot_settings" JSONB;
