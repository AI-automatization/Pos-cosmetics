-- Add WRITE_OFF to StockMovementType enum (T-bug: write-off was in schema but not in migration)
ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'WRITE_OFF';

-- Add WriteOffReason enum if not exists
DO $$ BEGIN
  CREATE TYPE "WriteOffReason" AS ENUM ('DAMAGED', 'EXPIRED', 'LOST', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
