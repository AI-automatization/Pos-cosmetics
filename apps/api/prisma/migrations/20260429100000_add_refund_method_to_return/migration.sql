-- AlterTable: add refund_method to returns
-- This tracks whether the refund was given as CASH or TERMINAL (card)
-- NULL = legacy returns created before this migration (admin panel path)
ALTER TABLE "returns" ADD COLUMN "refund_method" "PaymentMethod";
