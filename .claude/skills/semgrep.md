---
name: security:semgrep
description: Run Semgrep static analysis security scan on codebase using parallel subagents. Two modes: "run all" (full ruleset) or "important only" (high-confidence security vulnerabilities). Requires semgrep to be installed.
argument-hint: path to scan (default: .), mode (all|important), --no-confirm to skip approval gate
---

# Semgrep Security Scan

Static analysis security scanner using Semgrep with parallel execution across languages.

## Prerequisites

```bash
# Install semgrep
pip install semgrep
# or
brew install semgrep

# Verify
semgrep --version
```

## User Arguments

```
$ARGUMENTS
```

- Path to scan (default: `.`)
- Mode: `all` (full ruleset) or `important` (high-confidence only, default)
- `--no-confirm` to skip approval gate

## Workflow

### Phase 1 — Detection

Identify languages and check for Semgrep Pro:
```bash
# Check Pro availability
semgrep --pro --version 2>/dev/null && echo "Pro available" || echo "OSS only"

# Detect languages
find . -name "*.ts" -o -name "*.tsx" | head -5
find . -name "*.py" | head -5
find . -name "*.go" | head -5
```

### Phase 2 — Mode Selection

**`important` mode** (default — high-confidence only):
```bash
semgrep --metrics=off --config=p/security-audit --severity=ERROR --severity=WARNING
```

**`all` mode** (comprehensive):
```bash
semgrep --metrics=off \
  --config=p/security-audit \
  --config=p/owasp-top-ten \
  --config=p/typescript \
  --config=p/nodejs \
  --config=p/secrets
```

**RAOS-specific rulesets:**
- `p/typescript` — TypeScript/NestJS patterns
- `p/nodejs` — Node.js security
- `p/secrets` — Hardcoded secrets
- `p/owasp-top-ten` — OWASP Top 10
- `p/jwt` — JWT security issues
- `p/sql-injection` — SQL injection patterns

### Phase 3 — Approval Gate

⚠️ **ALWAYS** present scan plan to user before running. Show:
- Target directories
- Rulesets to be used
- Estimated scan time
- Pro vs OSS mode

Proceed ONLY after explicit user confirmation.

### Phase 4 — Parallel Execution

Launch parallel scanner agents per language category:

**TypeScript/JavaScript:**
```bash
semgrep --metrics=off --config=p/typescript --config=p/nodejs \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  apps/api apps/web apps/pos \
  --json > results/ts-scan.json
```

**Secrets scan (all files):**
```bash
semgrep --metrics=off --config=p/secrets \
  --no-git-ignore \
  --json > results/secrets-scan.json
```

**OWASP Top 10:**
```bash
semgrep --metrics=off --config=p/owasp-top-ten \
  apps/api \
  --json > results/owasp-scan.json
```

### Phase 5 — Consolidation

Merge results and filter:
```bash
# Summary
semgrep --metrics=off --config=p/security-audit apps/ \
  --json | jq '.results | length'

# Critical findings only
semgrep --metrics=off --config=p/security-audit apps/ \
  --json | jq '.results[] | select(.extra.severity == "ERROR")'
```

## Output

Results saved to `semgrep-results/` directory:
- `YYYY-MM-DD-HH-MM-scan.json` — raw SARIF output
- `findings-summary.md` — human-readable report

## RAOS Focus Areas

For RAOS specifically, pay attention to:
- `apps/api/src/` — NestJS backend (auth, SQL, input validation)
- `apps/web/src/` — Next.js frontend (XSS, env vars)
- `prisma/` — Schema security
- `.env*` files — secrets exposure

## Critical Rules

- Always use `--metrics=off` to prevent Semgrep telemetry
- Never skip the approval gate (--no-confirm) in production reviews
- Semgrep Pro detects ~250% more vulnerabilities via cross-file taint analysis
