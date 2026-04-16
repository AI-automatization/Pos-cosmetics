-- CreateEnum
CREATE TYPE "WarehouseInvoiceStatus" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');

-- AlterTable
ALTER TABLE "warehouse_invoices" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "status" "WarehouseInvoiceStatus" NOT NULL DEFAULT 'PENDING';
