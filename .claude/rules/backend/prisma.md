---
description: Prisma ORM rules for RAOS database
paths:
  - "apps/api/prisma/**"
  - "**/*.prisma"
---

# Prisma Rules

## Schema conventions
- Table naming: snake_case, plural
- `tenant_id` — MAJBURIY har business table da
- `created_at` — `@default(now())`
- `updated_at` — `@updatedAt`
- `deleted_at` — soft delete (DateTime?)
- Index: `@@index([tenant_id])` MAJBURIY

## Ledger/Fiscal tables
- `updated_at` YO'Q — immutable!
- UPDATE/DELETE TAQIQLANGAN

## Commands
- `npx prisma migrate dev --name [name]` — Migration yaratish
- `npx prisma generate` — Client generate (with engine, NOT --no-engine)
- `npx prisma validate` — Schema tekshirish
- HECH QACHON: `prisma migrate reset` — BARCHA DATA YO'QOLADI

## Migration Safety (T-390 dan olingan qoida)
- Data UPDATE/DELETE qiladigan migratsiyalarda avval backup column yaratish
- Masalan: `ALTER TABLE ADD COLUMN old_sku TEXT` → eski qiymatni saqlash
- Yoki: `CREATE TABLE _backup_sku AS SELECT id, sku FROM products`
- Backup siz bulk UPDATE — POS/scanner buzilishi xavfi

## Quirks (Windows)
- `incremental: false` in tsconfig — stale tsbuildinfo fix
- DLL lock: kill node process first, then `prisma generate`
- `.env` must be in `apps/api/` for ConfigModule
