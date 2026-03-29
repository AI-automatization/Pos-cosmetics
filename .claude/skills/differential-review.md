---
name: security:differential-review
description: Security-focused code change review. Analyzes PR/commit diffs for security regressions, calculates blast radius, checks test coverage, generates markdown report. Risk-first methodology from Trail of Bits.
argument-hint: PR number, commit hash, or branch name (e.g., "123", "main..feature/payments")
---

# Differential Security Review

Security-first analysis of code changes — finds security regressions before merge.

## User Arguments

```
$ARGUMENTS
```

- PR number: `123`
- Commit range: `main..feature/payments`
- Single commit: `abc1234`

## Risk Classification

### HIGH-risk changes (deep analysis required)
- Removed or commented-out security code
- Modified access control logic (guards, decorators, middleware)
- Eliminated input validation
- New external API calls without validation
- Changes to auth, JWT, session, CORS, Helmet config
- Ledger/payment amount calculations modified
- Tenant isolation logic changed

### MEDIUM-risk
- Business logic changes
- State management modifications
- New database queries

### LOW-risk
- Documentation, tests, UI-only, logging changes

## Six-Phase Workflow

### Phase 0 — Triage

```bash
# Get changed files
git diff --name-only main..HEAD
# or for PR:
gh pr diff 123 --name-only
```

Classify each file by risk level. If >10 HIGH-risk files → notify user, may need multiple sessions.

### Phase 1 — Code Analysis

For each HIGH-risk file:
```bash
gh pr diff 123 -- apps/api/src/auth/auth.guard.ts
# or
git diff main..HEAD -- apps/api/src/auth/auth.guard.ts
```

Look for:
- Lines removed from security checks
- `@Public()` decorator added (bypasses auth)
- `tenantId` check removed
- Validation removed
- New `$queryRaw` or `$executeRaw`

### Phase 2 — Test Coverage

```bash
# Does the changed file have tests?
find . -name "*.spec.ts" | xargs grep -l "auth.guard\|payments.service" 2>/dev/null

# Are there new tests for new functionality?
gh pr diff 123 -- "*.spec.ts"
```

### Phase 3 — Blast Radius

How many callers use the changed function?
```bash
grep -rn "createOrder\|processPayment" apps/api/src/ --include="*.ts" | wc -l
```

High blast radius (50+ callers) + HIGH risk change = immediate escalation.

### Phase 4 — Deep Context

Check git history for context:
```bash
git log --oneline -10 apps/api/src/payments/payments.service.ts
git blame apps/api/src/payments/payments.service.ts | head -50
```

Was this file recently fixed for a security bug? Is this change reverting a fix?

### Phase 5 — Adversarial Modeling

Think like an attacker. For each HIGH-risk change ask:
- Can an unauthenticated user access this now?
- Can user A access user B's data?
- Can a WAREHOUSE role access FINANCE data?
- Can a negative payment amount be processed?
- Can tenant isolation be bypassed?

### Phase 6 — Report Generation

Save to `security-review-[PR/commit].md`:

```markdown
# Security Differential Review
**Target**: PR #123 / main..feature/payments
**Date**: YYYY-MM-DD
**Risk Level**: HIGH

## Executive Summary
- Files changed: 12
- HIGH-risk files: 3
- Security findings: 2
- Test coverage: Partial

## Findings

### [DR-001] CRITICAL: Auth guard bypass added
- **File**: apps/api/src/payments/payments.controller.ts:15
- **Change**: `@Public()` decorator added to `/payments/webhook`
- **Blast Radius**: 1 endpoint, but receives external data
- **Risk**: Unauthenticated access to payment webhook
- **Fix**: Remove @Public(), use webhook signature verification instead

### [DR-002] HIGH: Tenant isolation removed in order query
- **File**: apps/api/src/sales/sales.service.ts:78
- **Change**: `-  where: { id, tenantId }` → `+  where: { id }`
- **Risk**: Any authenticated user can read any order across tenants
- **Fix**: Restore `tenantId: user.tenantId` in where clause

## Test Coverage Gaps
- payments.service.ts — no tests for new webhook handler

## Blast Radius Analysis
- `processPayment()`: 23 callers — MEDIUM blast radius
```

## Immediate Escalation Triggers

Stop and alert user immediately if found:
- Auth/guard code **removed** (not just modified)
- `tenantId` filter **removed** from any query
- `@Public()` added to financial endpoints
- Ledger entry **UPDATE** or **DELETE** added
- Payment amount validation **removed**
- `WAREHOUSE` role given access to finance/ledger endpoints
