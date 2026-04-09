---
name: check-errors
description: Check RAOS error logs and report issues
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash, Read, Grep, Glob
---

# Check RAOS Error Logs

Scan all log files for recent errors and create tasks for critical ones.

## Steps

1. Check if `logs/` directory exists at project root
2. Read today's error logs:
   - `logs/errors-YYYY-MM-DD.log` — Backend 5xx errors
   - `logs/client-YYYY-MM-DD.log` — Frontend/Mobile errors
   - `logs/api-YYYY-MM-DD.log` — All API requests (check for slow requests)
3. Parse JSON logs and identify:
   - Repeated errors (same message 3+ times)
   - Critical errors (5xx, unhandled exceptions)
   - Slow requests (> 500ms)
4. For each unique error, report:
   - Error message
   - File/module where it occurred
   - Count of occurrences
   - First and last timestamp
5. If critical errors found → suggest adding to `docs/Tasks.md` as P0/P1

## Output format

```
## Error Report — YYYY-MM-DD

### P0 (Critical)
- [MODULE] Error message (count: N, first: HH:MM, last: HH:MM)

### P1 (Important)
- [MODULE] Error message (count: N)

### Warnings
- [MODULE] Slow request: GET /api/v1/... (avg: XXXms)
```
