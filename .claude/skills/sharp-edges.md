---
name: security:sharp-edges
description: Identifies error-prone APIs, dangerous configurations, and footgun designs that make insecure usage the path of least resistance. Use when reviewing new APIs, auth systems, or crypto implementations.
argument-hint: file or module to review (e.g., apps/api/src/auth/, apps/api/src/payments/)
---

# Sharp Edges Analyzer

Identifies "footgun" patterns — designs that make insecure usage easier than secure usage.

## User Arguments

```
$ARGUMENTS
```

File or module path to analyze (default: `apps/api/src/`).

## Core Principle

**Secure usage must be the path of least resistance.**

If a developer must understand cryptography, read documentation carefully, or remember special rules to stay secure — the design has failed.

## Sharp Edge Categories

### 1. Algorithm Selection Footguns
APIs that let developers choose cryptographic algorithms are dangerous.

```typescript
// ❌ Footgun — caller chooses algorithm
async hash(data: string, algorithm: string = 'md5') {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

// ✅ Safe — algorithm fixed internally
async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
```

**Check in RAOS:**
```bash
grep -rn "createHash\|createCipher\|algorithm.*param" apps/api/src/ --include="*.ts"
```

### 2. Dangerous Defaults

```typescript
// ❌ Zero/false disables security
validateCertificate: boolean = false
skipAuth?: boolean              // default undefined = falsy = skips?
rateLimitEnabled = false        // production default should be true

// ✅ Secure defaults
validateCertificate: boolean = true
requireAuth: boolean = true
```

**Check:**
```bash
grep -rn "= false\|= null\|= undefined" apps/api/src/guards/ apps/api/src/middleware/ --include="*.ts"
```

### 3. Primitive vs Semantic APIs (Type Confusion)

```typescript
// ❌ Raw bytes — easy to confuse nonce vs key
encrypt(key: Buffer, nonce: Buffer, data: Buffer)

// ✅ Semantic types — impossible to swap
encrypt(key: EncryptionKey, nonce: Nonce, data: PlainText)
```

### 4. Configuration Cliffs

```typescript
// ❌ One typo = security disaster
{
  "cors": { "origins": "*" }   // typo from "origin"? still works, but wide open
}

// ✅ Validated config
@IsArray()
@IsUrl({}, { each: true })
ALLOWED_ORIGINS: string[];
```

### 5. Silent Failures

```typescript
// ❌ Returns boolean — easy to ignore
const isValid = verifyToken(token);
// developer forgets: if (!isValid) return;

// ✅ Throws on failure — impossible to ignore
verifyToken(token);  // throws InvalidTokenException if invalid
```

**Check:**
```bash
grep -rn "return.*false\|return.*null" apps/api/src/auth/ apps/api/src/guards/ --include="*.ts"
```

### 6. String-Typed Security Values

```typescript
// ❌ Permission as plain string — injectable
checkPermission(userId: string, permission: string)
// caller: checkPermission(userId, 'admin' + injectedInput)

// ✅ Typed enum — no injection possible
checkPermission(userId: string, permission: Permission)
enum Permission { READ = 'READ', WRITE = 'WRITE', ADMIN = 'ADMIN' }
```

**Check in RAOS:**
```bash
grep -rn "role.*string\|permission.*string" apps/api/src/ --include="*.ts"
grep -rn "hasRole\|hasPermission\|canActivate" apps/api/src/ --include="*.ts"
```

## RAOS-Specific Checks

### JWT Configuration
```bash
# algorithm fixed or developer-chosen?
grep -rn "JwtModule\|sign\|verify" apps/api/src/auth/ --include="*.ts"
```

### Multi-tenant Isolation
```bash
# tenant_id optional or required?
grep -rn "tenantId\?" apps/api/src/ --include="*.ts"
# ↑ Any "?" after tenantId = potential sharp edge
```

### Payment Amount Validation
```bash
# amount validation — can it be 0 or negative?
grep -rn "amount.*@Min\|amount.*@IsPositive" apps/api/src/payments/ --include="*.ts"
```

### Ledger Immutability
```bash
# can ledger entries be updated/deleted?
grep -rn "ledger.*update\|ledger.*delete\|LedgerEntry.*update" apps/api/src/ --include="*.ts"
```

## Analysis Output

```markdown
# Sharp Edges Report

## 🔴 Critical Footguns
### SE-001: Algorithm selection exposed to caller
- **File**: apps/api/src/crypto/crypto.service.ts:23
- **Pattern**: Algorithm Selection Footgun
- **Risk**: Attacker or confused developer can specify weak algorithm
- **Fix**: Hardcode algorithm, remove parameter

## 🟡 Design Warnings
### SE-002: Optional tenantId in CreateOrderDto
- **File**: apps/api/src/sales/dto/create-order.dto.ts:8
- **Pattern**: Missing Required Security Parameter
- **Risk**: Order created without tenant isolation
- **Fix**: Make tenantId required, inject from JWT not DTO
```

## Rationalizations to Reject

These are NOT valid excuses for sharp edges:
- "It's documented" — developers don't always read docs
- "Advanced users need flexibility" — security should not be optional
- "Backwards compatibility" — insecure defaults cannot be excused
- "It won't happen in production" — prove it with validation, not assumptions
