---
name: kaizen:analyse-problem
description: Toyota A3 structured problem-solving methodology. Use for incidents, recurring bugs, production issues, or major improvements. Produces concise one-page analysis: Background, Current Condition, Goal, Root Cause, Countermeasures, Plan, Follow-up.
argument-hint: describe the problem (e.g., "POS sync fails after 100+ orders", "payment double-charge bug")
---

# A3 Problem Analysis

Structured problem-solving using Toyota's A3 methodology. Best for: incidents, recurring issues, production bugs, major improvements.

**NOT for:** small one-line fixes, trivial issues.

## User Arguments

```
$ARGUMENTS
```

Describe the problem clearly and factually.

## A3 Seven-Section Format

### Section 1 — Background

Context and business impact:
- What system/feature is affected?
- How long has this been happening?
- Who is impacted (users, tenants, revenue)?
- Why is this important to solve now?

Example:
```
POS sync has been intermittently failing since v2.1 deployment (2026-03-20).
Affects ~15% of offline transactions. Cashiers must manually re-enter sales.
Business impact: ~30 min/day lost per branch, risk of data inconsistency.
```

### Section 2 — Current Condition

Facts only — no interpretation, no blame:
- What exactly happens? (with error messages)
- How often? (frequency, pattern)
- Under what conditions?
- What data do we have?

```
Error: "Sync queue overflow — batch size 100 exceeds limit"
Frequency: Occurs after ~100 transactions accumulated offline
Trigger: High-volume branches (>200 orders/day) during network outage
Logs: apps/api/logs/errors-2026-03-25.log line 1247
```

### Section 3 — Goal / Target

Measurable success criteria:
- What does "fixed" look like?
- Specific, measurable, time-bound

```
Goal: Zero sync failures for batches up to 500 transactions
Target date: 2026-03-30
Metric: 0 sync errors in logs for 7 consecutive days after fix
```

### Section 4 — Root Cause Analysis

Use 5 Whys technique:

```
Problem: Sync fails on large batches

Why 1: Batch size exceeds 100 transaction limit
Why 2: No chunking implemented in sync service
Why 3: Initial implementation assumed small offline periods
Why 4: No requirement for high-volume branches in original spec
Why 5: Testing only used 10-transaction batches

ROOT CAUSE: Sync service lacks batch chunking for large offline accumulations
```

Additional tools if needed:
- Fishbone diagram (categories: Code, Config, Process, Data, Infrastructure)
- Timeline analysis (what changed before problem started?)

### Section 5 — Countermeasures

Solutions that address ROOT CAUSE (not symptoms):

| # | Countermeasure | Addresses Which Why | Owner | Date |
|---|---------------|---------------------|-------|------|
| 1 | Implement batch chunking (max 50/batch) | Why 2 | Ibrat | 2026-03-28 |
| 2 | Add sync progress monitoring | Why 3 | Ibrat | 2026-03-28 |
| 3 | Update load test scenarios to 500+ orders | Why 4 | Bekzod | 2026-03-30 |

### Section 6 — Implementation Plan

```
Day 1 (2026-03-28):
  [ ] Ibrat: Implement chunking in apps/api/src/sync/sync.service.ts
  [ ] Ibrat: Add retry logic per chunk
  [ ] Ibrat: Write tests with 500-order batch

Day 2 (2026-03-29):
  [ ] Ibrat: Deploy to staging, monitor logs
  [ ] Bekzod: QA test with high-volume simulation

Day 3 (2026-03-30):
  [ ] Team: Deploy to production
  [ ] Ibrat: Monitor for 24h
```

### Section 7 — Follow-up

Verification and prevention:

**How to verify fix works:**
- Run test with 500-transaction batch on staging
- Monitor `errors-*.log` for 7 days post-deploy
- Check sync metrics dashboard

**Prevention (horizontal deployment):**
- Apply same chunking to all queue-based operations
- Add `maxBatchSize` config parameter to all sync workers
- Add integration test for large-batch scenarios to CI

**Knowledge sharing:**
- Update `docs/Tasks.md` with fix reference
- Add to `docs/Done.md` with solution summary
- Update sync worker documentation

---

## Full A3 Output Template

```markdown
# A3 Problem Analysis: [Problem Title]
**Date**: YYYY-MM-DD | **Owner**: [Name] | **Status**: In Progress

## 1. Background
[context and impact]

## 2. Current Condition
[facts, data, error messages]

## 3. Goal
[measurable success criteria]

## 4. Root Cause (5 Whys)
Why 1: ...
Why 2: ...
...
**ROOT CAUSE**: ...

## 5. Countermeasures
| # | Action | Owner | Date |
...

## 6. Implementation Plan
[timeline with checkboxes]

## 7. Follow-up
[verification + prevention]
```

## When NOT to Use A3

- Simple one-line bug fix → just fix it
- Clear root cause already known → go straight to fix
- Cosmetic/style issue → not worth the overhead

Use A3 for: recurring issues, production incidents, architectural problems, anything that takes >4 hours to fix.
