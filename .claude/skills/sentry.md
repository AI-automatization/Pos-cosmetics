---
name: monitoring:sentry
description: Sentry error monitoring integration — list issues, view events, track errors, manage releases. Requires SENTRY_AUTH_TOKEN environment variable or Maton API key.
argument-hint: what to do (list-issues, view-issue ID, list-projects, errors-today, slow-transactions)
---

# Sentry Error Monitoring

Monitor RAOS application errors, performance issues, and releases via Sentry API.

## Prerequisites

### Option A — Direct Sentry API (Recommended)
```bash
# Set auth token in .env.local or environment
export SENTRY_AUTH_TOKEN=sntrys_...
export SENTRY_ORG=your-org-slug
export SENTRY_PROJECT=raos-api  # or raos-web, raos-pos
```

Get token at: https://sentry.io/settings/account/api/auth-tokens/

### Option B — Maton Gateway
```bash
export MATON_API_KEY=your-maton-key
# API base: https://gateway.maton.ai/sentry/
```

## User Arguments

```
$ARGUMENTS
```

- `list-issues` — show unresolved issues
- `view-issue 12345` — details for issue ID
- `errors-today` — errors from last 24 hours
- `slow-transactions` — performance issues
- `list-projects` — show all Sentry projects
- `recent-errors` — latest error events

## Common Operations

### List Unresolved Issues
```bash
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?is=unresolved&limit=20" \
  | jq '.[] | {id, title, count, firstSeen, lastSeen, level}'
```

### Filter by Severity
```bash
# Only errors (not warnings)
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?is=unresolved&level=error&limit=50"
```

### View Specific Issue
```bash
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/issues/$ISSUE_ID/" \
  | jq '{title, culprit, count, userCount, firstSeen, lastSeen, metadata}'

# Get stack trace
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/issues/$ISSUE_ID/events/latest/" \
  | jq '.entries[] | select(.type == "exception") | .data.values[0].stacktrace.frames[-5:]'
```

### Errors in Last 24 Hours
```bash
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?is=unresolved&query=firstSeen:>-24h" \
  | jq 'length'
```

### Slow Transactions (Performance)
```bash
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/organizations/$SENTRY_ORG/events/?field=transaction&field=p95()&sort=-p95()&query=project:$SENTRY_PROJECT" \
  | jq '.data[:10]'
```

## RAOS Sentry Projects Setup

Recommended project structure:
- `raos-api` — NestJS backend errors
- `raos-web` — Next.js frontend errors
- `raos-pos` — Tauri POS desktop errors

### Error Categories to Watch

**P0 triggers (alert immediately):**
- `PaymentService` errors
- `LedgerService` errors
- `AuthGuard` failures spike
- Database connection errors
- 5xx error rate > 1%

**P1 (next day):**
- `InventoryService` stock calculation errors
- `FiscalService` receipt failures
- Sync errors in POS

### Integration with RAOS Workflow

When Sentry shows P0 errors:
1. View issue: `/monitoring:sentry view-issue <ID>`
2. Copy stack trace
3. Use `/root-cause-tracing` to find cause
4. Create task: add to `docs/Tasks.md`

## Output Format

```markdown
# Sentry Report — RAOS API
Date: YYYY-MM-DD

## 🔴 Critical Issues (Unresolved)
| ID | Title | Count | Last Seen |
|----|-------|-------|-----------|
| 1234 | TypeError in PaymentService | 47 | 2 hours ago |

## 🟡 Recent Warnings
...

## 📊 24h Stats
- Total errors: 12
- Affected users: 3
- New issues: 2
```
