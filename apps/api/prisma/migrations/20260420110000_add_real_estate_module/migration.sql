-- T-350: Real Estate module — Property, RentalContract, RentalPayment

CREATE TYPE "PropertyType" AS ENUM ('OFFICE', 'WAREHOUSE', 'RETAIL', 'APARTMENT');
CREATE TYPE "PropertyStatus" AS ENUM ('RENTED', 'VACANT', 'MAINTENANCE');
CREATE TYPE "RentalPaymentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

CREATE TABLE "properties" (
    "id"          TEXT NOT NULL,
    "tenant_id"   TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "address"     TEXT NOT NULL,
    "type"        "PropertyType" NOT NULL DEFAULT 'OFFICE',
    "status"      "PropertyStatus" NOT NULL DEFAULT 'VACANT',
    "rent_amount" DECIMAL(15,2) NOT NULL,
    "currency"    TEXT NOT NULL DEFAULT 'UZS',
    "area"        DECIMAL(10,2),
    "roi"         DECIMAL(5,2),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rental_contracts" (
    "id"           TEXT NOT NULL,
    "tenant_id"    TEXT NOT NULL,
    "property_id"  TEXT NOT NULL,
    "lessee_name"  TEXT NOT NULL,
    "lessee_phone" TEXT,
    "start_date"   TIMESTAMP(3) NOT NULL,
    "end_date"     TIMESTAMP(3) NOT NULL,
    "is_active"    BOOLEAN NOT NULL DEFAULT true,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_contracts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rental_payments" (
    "id"           TEXT NOT NULL,
    "tenant_id"    TEXT NOT NULL,
    "property_id"  TEXT NOT NULL,
    "lessee_name"  TEXT NOT NULL,
    "amount"       DECIMAL(15,2) NOT NULL,
    "currency"     TEXT NOT NULL DEFAULT 'UZS',
    "due_date"     TIMESTAMP(3) NOT NULL,
    "paid_date"    TIMESTAMP(3),
    "status"       "RentalPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "month"        TEXT NOT NULL,
    "note"         TEXT,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "properties_tenant_id_idx" ON "properties"("tenant_id");
CREATE INDEX "properties_tenant_id_status_idx" ON "properties"("tenant_id", "status");
CREATE INDEX "rental_contracts_tenant_id_idx" ON "rental_contracts"("tenant_id");
CREATE INDEX "rental_contracts_property_id_idx" ON "rental_contracts"("property_id");
CREATE INDEX "rental_payments_tenant_id_idx" ON "rental_payments"("tenant_id");
CREATE INDEX "rental_payments_property_id_idx" ON "rental_payments"("property_id");
CREATE INDEX "rental_payments_tenant_id_status_idx" ON "rental_payments"("tenant_id", "status");

ALTER TABLE "properties" ADD CONSTRAINT "properties_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_property_id_fkey"
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rental_payments" ADD CONSTRAINT "rental_payments_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rental_payments" ADD CONSTRAINT "rental_payments_property_id_fkey"
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
