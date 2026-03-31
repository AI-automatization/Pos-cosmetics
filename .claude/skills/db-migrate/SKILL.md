---
name: db-migrate
description: Create and apply Prisma database migrations
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash, Read
---

# Prisma Database Migration

Create, validate, and apply database migrations safely.

## Usage
```
/db-migrate <migration-name>
```

## Steps

1. Set PATH: `export PATH="/c/Users/Asus/AppData/Roaming/npm:$PATH"`
2. Validate schema first:
   ```bash
   cd C:/Users/Asus/Desktop/POS/apps/api && npx prisma validate
   ```
3. If $ARGUMENTS provided, create migration:
   ```bash
   npx prisma migrate dev --name $ARGUMENTS
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Report:
   - Migration file created (path)
   - Tables affected
   - Any warnings

## Safety rules
- NEVER run `prisma migrate reset` — destroys all data
- Always validate before migrate
- Check for destructive changes (DROP TABLE, DROP COLUMN)
- Warn if migration affects ledger/fiscal tables (immutable data)
