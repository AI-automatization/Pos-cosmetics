---
name: security:insecure-defaults
description: Detects fail-open insecure defaults — hardcoded secrets, weak auth, permissive security settings that allow apps to run insecurely in production. Use before deployment or security audit.
argument-hint: path to scan (default: apps/), or specific file
---

# Insecure Defaults Detector

Finds fail-open vulnerabilities where apps run insecurely due to missing or weak configuration.

## User Arguments

```
$ARGUMENTS
```

Path to scan (default: `apps/`).

## Core Concept

**Fail-open (BAD — exploitable):**
```typescript
const SECRET = process.env.JWT_SECRET || 'default_secret';  // ← DANGEROUS
const DEBUG = process.env.DEBUG ?? true;                     // ← DANGEROUS
```

**Fail-secure (GOOD — safe crash):**
```typescript
const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET is required');      // ← SAFE
```

## Scan Phases

### Phase 1 — Search

Scan for insecure patterns:

```bash
# Hardcoded fallback secrets
grep -rn "|| 'secret\||| \"secret\|?? 'default\|?? \"default" apps/

# Weak JWT secrets
grep -rn "jwt.*secret\|JWT_SECRET\|jwtSecret" apps/api/src/ --include="*.ts"

# Disabled security in production
grep -rn "validateCert.*false\|rejectUnauthorized.*false\|NODE_TLS_REJECT_UNAUTHORIZED" apps/

# Permissive CORS
grep -rn "origin.*true\|cors.*\*\|allowedOrigins.*\*" apps/api/src/

# Disabled auth guards
grep -rn "@Public\|skipAuth\|IS_PUBLIC_KEY" apps/api/src/ --include="*.ts"

# Hardcoded credentials
grep -rn "password.*=.*['\"][a-zA-Z0-9]\|apiKey.*=.*['\"][a-zA-Z0-9]" apps/ --include="*.ts"

# Weak bcrypt rounds
grep -rn "bcrypt.*hash\|genSalt" apps/ --include="*.ts"

# Default admin passwords
grep -rn "admin.*admin\|password.*12345\|password.*password" apps/ --include="*.ts"
```

### Phase 2 — Verify

For each hit, trace the code path:
1. Is this code reachable in production?
2. Does an env var override exist?
3. If env var missing — does app crash (good) or use default (bad)?

### Phase 3 — Confirm Production Impact

Check deployment config:
```bash
# Check .env.example for required variables
cat .env.example 2>/dev/null || cat .env.sample 2>/dev/null

# Check docker-compose for env vars
grep -A5 "environment:" docker/docker-compose.yml 2>/dev/null

# Check if SECRET vars are truly required
grep -rn "process.env\." apps/api/src/config/ --include="*.ts"
```

## RAOS-Specific Checks

### NestJS Config Validation
```typescript
// ✅ Good — fail-secure
@IsNotEmpty()
@MinLength(32)
JWT_SECRET: string;

// ❌ Bad — fail-open
JWT_SECRET: string = 'default';
```

### Prisma Multi-tenant
```bash
# Check tenant_id is never optional/defaulted
grep -rn "tenantId.*undefined\|tenantId.*null\|tenantId.*''" apps/api/src/ --include="*.ts"
```

### Payment/Ledger Security
```bash
# Check payment amounts are validated
grep -rn "amount.*0\|amount.*undefined" apps/api/src/payments/ --include="*.ts"
```

## Output Format

```markdown
# Insecure Defaults Report — RAOS

## 🔴 Critical (Fail-Open)
### HC-001: Hardcoded JWT fallback
- **File**: apps/api/src/auth/auth.module.ts:15
- **Code**: `secret: process.env.JWT_SECRET || 'fallback_secret'`
- **Risk**: App runs with weak JWT in production if env var missing
- **Fix**: Remove fallback, add validation in ConfigModule

## 🟡 Medium
...

## ✅ Summary
- Files scanned: X
- Critical issues: N
- Medium issues: N
```

## What to Ignore

- Test fixtures (`*.spec.ts`, `*.test.ts`)
- Example files (`*.example.*`, `*.sample.*`)
- Documentation comments
- Development-only code guarded by `NODE_ENV === 'test'`
