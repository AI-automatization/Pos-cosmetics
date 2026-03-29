---
name: changelog-generator
description: Automatically creates user-facing changelogs from git commits by analyzing commit history, categorizing changes, and transforming technical commits into clear, customer-friendly release notes.
argument-hint: time period (e.g., "last week", "v1.2.0..v1.3.0"), or leave empty for since last tag
---

# Changelog Generator

Automatically creates user-facing changelogs from git commits.

## User Arguments

```
$ARGUMENTS
```

- Time period: "last week", "last month", specific dates like "2026-03-01..2026-03-28"
- Version range: "v1.2.0..v1.3.0" or "v1.2.0..HEAD"
- If empty: generate since last git tag

## Workflow

### 1. Collect Commits

```bash
# Since last tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%H|%s|%b|%an|%ad" --date=short

# By time period
git log --since="2026-03-01" --until="2026-03-28" --pretty=format:"%H|%s|%b|%an|%ad" --date=short

# By version range
git log v1.2.0..v1.3.0 --pretty=format:"%H|%s|%b|%an|%ad" --date=short
```

### 2. Filter & Categorize

**Include:**
- `feat(*)`: New features → ✨ New Features
- `fix(*)`: Bug fixes → 🐛 Bug Fixes
- `perf(*)`: Performance improvements → ⚡ Performance
- `security(*)`: Security fixes → 🔒 Security

**Exclude (internal, don't show users):**
- `chore(*)`: Tooling, CI/CD
- `refactor(*)`: Code cleanup (no behavior change)
- `test(*)`: Test additions
- `docs(*)`: Documentation only
- `style(*)`: Formatting

### 3. Transform to User Language

Convert technical commits to customer-friendly language:

| Commit | User-Facing |
|--------|-------------|
| `fix(auth): null pointer when tenant not loaded` | Fixed login issue that caused errors for some accounts |
| `feat(catalog): add barcode scanner to product create` | Products can now be added by scanning a barcode |
| `perf(inventory): optimize stock query with index` | Stock report loads significantly faster |
| `fix(pos): offline sync fails on large order batches` | Fixed sync issue when processing large orders offline |

### 4. Output Format

```markdown
# Changelog

## [Unreleased] — 2026-03-28

### ✨ New Features
- Products can now be added by scanning a barcode
- Dashboard now shows real-time inventory alerts
- Nasiya (credit) payments can be tracked per customer

### 🐛 Bug Fixes
- Fixed login issue that caused errors for some accounts
- Fixed sync issue when processing large orders offline
- Fixed category filter not working on mobile view

### ⚡ Performance
- Stock report loads significantly faster
- Product search now returns results in under 100ms

### 🔒 Security
- Strengthened password validation rules
- Fixed session timeout not working correctly
```

### 5. Save Output

```bash
# Prepend to existing CHANGELOG.md
# Or create new file
```

## RAOS Conventions

RAOS uses Conventional Commits with these modules:
- `identity` → Authentication & user management
- `catalog` → Products & categories
- `inventory` → Stock & warehouse
- `sales` → Orders & POS
- `payments` → Payment processing
- `pos` → POS Desktop app
- `admin` → Web admin panel
- `mobile` → Mobile app
- `sync` → Offline sync

Map these to user-friendly section names in the changelog.

## Usage Examples

```
/changelog-generator last week
/changelog-generator v1.2.0..HEAD
/changelog-generator 2026-03-01..2026-03-28
```
