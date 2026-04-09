---
name: db:postgres
description: Execute safe read-only SQL queries against PostgreSQL databases. Multi-connection support, schema exploration, data analysis. All queries run in read-only transactions — no data modification possible.
argument-hint: SQL query or describe what data you need (e.g., "show all products for tenant X", "analyze slow queries")
---

# PostgreSQL Read-Only Query Tool

Safe database exploration for RAOS PostgreSQL instance.

## Prerequisites

Configure `connections.json` (keep permissions at 600):

```bash
# Create config file
cat > ~/.claude-postgres-connections.json << 'EOF'
{
  "connections": [
    {
      "name": "raos-dev",
      "description": "RAOS development database — products, orders, inventory, ledger",
      "host": "localhost",
      "port": 5432,
      "database": "raos_dev",
      "user": "raos_readonly",
      "password": "",
      "ssl": false
    }
  ]
}
EOF
chmod 600 ~/.claude-postgres-connections.json
```

**Create read-only user:**
```sql
CREATE USER raos_readonly WITH PASSWORD 'readonly_pass';
GRANT CONNECT ON DATABASE raos_dev TO raos_readonly;
GRANT USAGE ON SCHEMA public TO raos_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO raos_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO raos_readonly;
```

## User Arguments

```
$ARGUMENTS
```

Natural language query or SQL — describe what you need.

## Security Rules

All queries run in read-only transactions:
```sql
BEGIN TRANSACTION READ ONLY;
-- your query here
ROLLBACK;
```

Only allowed: `SELECT`, `SHOW`, `EXPLAIN`, `WITH`, `DESCRIBE`
Blocked: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `TRUNCATE`
Max rows: 10,000 (to prevent memory issues)
Timeout: 30 seconds

## Common RAOS Queries

### Schema Exploration
```sql
-- List all tables
SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name::regclass) DESC;

-- Table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Product'
ORDER BY ordinal_position;

-- Indexes on table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'StockMovement';
```

### Tenant Data Analysis
```sql
-- Products per tenant
SELECT "tenantId", COUNT(*) as product_count
FROM "Product"
GROUP BY "tenantId"
ORDER BY product_count DESC;

-- Recent orders for a tenant
SELECT o.id, o."createdAt", o."totalAmount", o.status
FROM "Order" o
WHERE o."tenantId" = 'YOUR_TENANT_ID'
ORDER BY o."createdAt" DESC
LIMIT 20;
```

### Inventory Debug
```sql
-- Current stock levels
SELECT p.name, s."warehouseId", SUM(
  CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE -sm.quantity END
) as current_stock
FROM "StockMovement" sm
JOIN "Product" p ON p.id = sm."productId"
JOIN "Warehouse" s ON s.id = sm."warehouseId"
WHERE sm."tenantId" = 'YOUR_TENANT_ID'
GROUP BY p.name, s."warehouseId"
HAVING SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE -sm.quantity END) < 10
ORDER BY current_stock ASC;
```

### Ledger Verification
```sql
-- Check double-entry balance (should always be 0)
SELECT SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE -amount END) as balance
FROM "LedgerEntry"
WHERE "tenantId" = 'YOUR_TENANT_ID';

-- Recent ledger entries
SELECT le."createdAt", le.type, le.amount, le."accountCode", le.description
FROM "LedgerEntry" le
WHERE le."tenantId" = 'YOUR_TENANT_ID'
ORDER BY le."createdAt" DESC
LIMIT 50;
```

### Performance Analysis
```sql
-- Slow queries (requires pg_stat_statements)
SELECT query, calls, mean_exec_time::int as avg_ms, max_exec_time::int as max_ms
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Missing indexes (sequential scans)
SELECT relname, seq_scan, idx_scan,
  seq_scan - idx_scan AS diff
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY diff DESC;
```

### Debug Queries
```sql
-- Active connections
SELECT pid, usename, application_name, state, query_start, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Table bloat
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC
LIMIT 10;
```

## Usage Examples

```
/db:postgres show me all tenants and their order counts
/db:postgres find products with stock below 5 for tenant abc123
/db:postgres explain slow query: SELECT * FROM Order WHERE status = 'PENDING'
/db:postgres check if ledger is balanced for tenant xyz
```
