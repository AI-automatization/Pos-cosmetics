---
name: security:supply-chain-audit
description: Identifies pnpm/npm dependencies at heightened risk of exploitation or takeover. Evaluates: single maintainer, unmaintained status, low popularity, high-risk features, past CVEs, missing security contacts.
argument-hint: path to package.json (default: root), or specific package name to check
---

# Supply Chain Risk Auditor

Identifies high-risk dependencies that could compromise the RAOS supply chain.

## User Arguments

```
$ARGUMENTS
```

- Default: scan all `package.json` files in monorepo
- Specific package: `express`, `jsonwebtoken`

## Prerequisites

```bash
# GitHub CLI required for repo analysis
gh --version

# pnpm for dependency listing
pnpm --version
```

## Six Risk Criteria

For each dependency, evaluate:

1. **Single maintainer** — individual vs organization ownership
2. **Unmaintained** — last commit > 6 months, no recent releases
3. **Low popularity** — <1000 weekly downloads, <100 GitHub stars
4. **High-risk features** — FFI, eval, exec, child_process, network requests
5. **Past CVEs** — history of vulnerabilities, especially critical ones
6. **Missing security contact** — no SECURITY.md, no vulnerability disclosure policy

## Workflow

### Phase 1 — Collect Dependencies

```bash
# List all direct dependencies across monorepo
cat apps/api/package.json | jq '.dependencies | keys[]'
cat apps/web/package.json | jq '.dependencies | keys[]'
cat apps/pos/package.json | jq '.dependencies | keys[]'

# Or using pnpm
pnpm list --depth=0 --json
```

### Phase 2 — Evaluate Each Dependency

For each package, check:

```bash
# npm stats
npm info <package> --json | jq '{name, version, maintainers, repository, lastPublish: .time.modified}'

# GitHub repo stats (if available)
gh api repos/<owner>/<repo> --jq '{stars: .stargazers_count, updated: .updated_at, archived: .archived}'

# Check for CVEs
gh api "https://api.osv.dev/v1/query" -X POST -f "package.name=<package>" -f "package.ecosystem=npm"
```

### Phase 3 — Audit Report

Create `.supply-chain-risk-auditor/report.md`:

```markdown
# Supply Chain Risk Report — RAOS
Date: YYYY-MM-DD

## 🔴 HIGH RISK Dependencies

### jsonwebtoken (v8.5.1)
- **Risk**: Single maintainer, 3 CVEs in past 2 years
- **Downloads**: 12M/week (high popularity ✅)
- **Last commit**: 8 months ago ⚠️
- **Recommendation**: Consider `jose` library (actively maintained, zero CVEs)

## 🟡 MEDIUM RISK

### some-package (v1.2.3)
- **Risk**: Low popularity (800 weekly downloads)
- **Alternative**: <suggestion>

## ✅ LOW RISK (sample)
- @nestjs/core — Actively maintained, NestJS team
- prisma — Actively maintained, Prisma team
- next — Actively maintained, Vercel team

## Summary
- Total direct deps: 45
- HIGH risk: 2
- MEDIUM risk: 5
- LOW risk: 38
```

## RAOS Critical Dependencies to Monitor

These packages have direct access to sensitive data:
```
jsonwebtoken / jose     — JWT signing/verification
bcrypt / argon2         — Password hashing
prisma                  — Database ORM (full DB access)
@nestjs/throttler       — Rate limiting
helmet                  — Security headers
class-validator         — Input validation
```

Any HIGH-risk finding in these = **immediate action required**.

## Quick Checks

```bash
# Check for known vulnerabilities
pnpm audit

# Check for outdated packages
pnpm outdated

# Check specific package CVEs
pnpm audit --filter jsonwebtoken
```

## Recommendations for Findings

- **Single maintainer + widely used**: Monitor closely, consider forking
- **Unmaintained**: Find alternative or fork with security patches
- **Past CVEs**: Ensure you're on patched version, watch for new advisories
- **Missing security contact**: Report vulnerabilities to npm security team
