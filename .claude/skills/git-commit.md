---
name: dev:git-commit
description: Smart conventional commit helper with emoji, auto-staging, diff analysis, and multi-commit splitting. Follows RAOS commit format: feat(module): description.
argument-hint: optional commit message hint, or --no-verify to skip lint
---

# Conventional Commit Helper

Smart git commit with conventional format, emoji, and change analysis.

## User Arguments

```
$ARGUMENTS
```

- Optional message hint: `"add barcode scanner to product form"`
- `--no-verify` — skip pre-commit hooks (use sparingly)
- `--split` — force split into multiple commits

## Workflow

### Step 1 — Branch Check

```bash
git branch --show-current
```

If on `main` or `master`:
- Warn user
- Offer to create feature branch: `ibrat/feat-[description]`

### Step 2 — Pre-commit Checks

```bash
# Run lint (unless --no-verify)
pnpm lint 2>&1 | tail -20

# TypeScript check
pnpm --filter api exec tsc --noEmit 2>&1 | tail -20
```

### Step 3 — Stage & Analyze

```bash
# Check what's changed
git status
git diff --stat

# Auto-stage if nothing staged
git add -A  # only if user confirms
```

Analyze diff for:
- How many logical changes?
- Different modules affected?
- Should this be split into multiple commits?

### Step 4 — Commit Type Selection

| Emoji | Type | When |
|-------|------|------|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| 🔒 | `fix(security)` | Security fix |
| ♻️ | `refactor` | Code restructure, no behavior change |
| 📝 | `docs` | Documentation only |
| ✅ | `test` | Test additions/fixes |
| 🎨 | `style` | Formatting, no logic change |
| ⚡ | `perf` | Performance improvement |
| 🔧 | `chore` | Build, config, tooling |
| 🚑 | `hotfix` | Critical production fix |
| 🗄️ | `db` | Prisma migration, schema change |
| 🌐 | `i18n` | Internationalization |

### Step 5 — Module Detection

RAOS modules for commit scope:
```
identity, catalog, inventory, sales, payments, ledger,
tax, nasiya, promotions, reports, pos, admin, mobile,
sync, infra, auth, worker, bot
```

Auto-detect from changed file paths:
- `apps/api/src/catalog/` → `catalog`
- `apps/api/src/payments/` → `payments`
- `apps/web/src/app/(admin)/dashboard/` → `admin`
- `prisma/` → `db`
- `docker/` → `infra`

### Step 6 — Commit Message

Format: `<emoji> <type>(<module>): <description>`

```bash
# Single commit
git commit -m "✨ feat(catalog): add barcode scanner to product creation form"

# With body if complex
git commit -m "🐛 fix(payments): handle null tenant in payment intent creation

Payment service was crashing when tenant was not loaded in JWT.
Fixed by eager-loading tenant in JwtStrategy.

Closes #T-234"
```

### Step 7 — Split Detection

If changes span multiple modules, suggest split:

```
I detected changes in 2 separate concerns:
1. apps/api/src/catalog/ — new barcode scanner logic
2. apps/web/src/app/catalog/ — UI for barcode scanner

Recommended split:
  Commit 1: ✨ feat(catalog): add barcode scanner service (backend)
  Commit 2: ✨ feat(admin): add barcode scanner UI (frontend)

Split into 2 commits? [y/n]
```

## RAOS Commit Examples

```bash
✨ feat(nasiya): add installment payment tracking
🐛 fix(inventory): incorrect stock calculation on transfer
🔒 fix(security): block WAREHOUSE role from finance endpoints
♻️ refactor(sales): extract order validation to separate service
🗄️ db(catalog): add barcode field to Product table
⚡ perf(reports): add index on Order.createdAt
📝 docs(api): update API endpoint documentation
✅ test(payments): add tenant isolation tests
🔧 chore(infra): upgrade Node.js to 20.x in Docker
```

## Quick Commands

```bash
# Standard commit (auto-detect type)
/dev:git-commit

# With hint
/dev:git-commit "fix order total calculation"

# Force split analysis
/dev:git-commit --split

# Skip hooks (emergency only)
/dev:git-commit --no-verify
```
