-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "debt_limit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gender" TEXT;
