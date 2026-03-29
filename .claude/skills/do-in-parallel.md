---
name: dev:do-in-parallel
description: Orchestrates multiple independent sub-agents simultaneously across files or targets. Uses intelligent model selection (Haiku/Sonnet/Opus) and judge verification. Use when the same task needs to run on multiple independent files.
argument-hint: task description with --files "file1 file2 file3" or --targets "target1 target2"
---

# Parallel Agent Dispatch

Execute the same task across multiple independent files or targets simultaneously.

## User Arguments

```
$ARGUMENTS
```

Format: `<task description> --files "file1 file2 ..."` or `--targets "t1 t2 ..."`

Examples:
- `add JSDoc comments --files "apps/api/src/catalog/catalog.service.ts apps/api/src/inventory/inventory.service.ts"`
- `write unit tests --files "$(find apps/api/src -name '*.service.ts' | grep -v spec | head -5)"`
- `audit for tenant isolation --targets "catalog payments inventory sales"`

## Critical Rules

**MUST DO:**
- Use Agent tool exclusively for all implementation work
- Launch ALL agents in a single response (true parallel)
- Verify each agent's output with a judge agent
- Max 10-15 targets per batch

**NEVER DO:**
- Read files or write code yourself (delegate everything)
- Launch agents one at a time (defeats parallelism)
- Skip judge verification
- Mix targets that share files (race condition)

## Workflow

### Phase 1 — Parse Targets

Extract list of files/targets from arguments.
If `--files`, get the list.
If not specified, ask user to clarify.

### Phase 2 — Independence Check

Before proceeding, verify targets are safe to parallelize:
- No shared file modifications
- No cross-target data dependencies
- Execution order doesn't matter
- No race conditions

If ANY check fails → use sequential execution instead.

### Phase 3 — Model Selection

| Task Type | Model |
|-----------|-------|
| Complex analysis, security review | Opus |
| Code generation, refactoring | Sonnet |
| Mechanical transformation, formatting | Haiku |
| Uncertain | Opus (quality first) |

### Phase 4 — Meta-Judge (Once)

Launch ONE meta-judge agent BEFORE parallel agents:
```
Generate evaluation criteria YAML for this task: [task description]
Consider: correctness, completeness, follows project conventions, no regressions
Output: YAML specification for judging agent results
```

### Phase 5 — Launch All Agents (Parallel)

Launch ALL agents in a single message. Each agent gets:
- Isolated context (only its target's files)
- Exact task description
- Self-critique requirement: "Before finishing, review your work and check for issues"

Template for each agent:
```
Task: [exact task description]
Target: [specific file/module]
Context: [relevant project info]
Constraint: [any restrictions]
Self-critique: Review your work before completing.
```

### Phase 6 — Judge Verification

Launch judge agent for each result using meta-judge YAML:
- Parse only VERDICT (pass/fail), SCORE (0-100), ISSUES
- PASS (score ≥ 80) → accept result
- FAIL → retry (max 3 attempts per target)
- After 3 fails → report to user, skip target

### Phase 7 — Summary

```markdown
# Parallel Execution Summary

## Results
| Target | Status | Score | Issues |
|--------|--------|-------|--------|
| catalog.service.ts | ✅ PASS | 92 | none |
| inventory.service.ts | ✅ PASS | 87 | minor warning |
| payments.service.ts | ❌ FAIL | 45 | missing tenant check |

## Failures (require manual review)
- payments.service.ts: [specific issue]

## Completed: 2/3 targets
```

## RAOS Usage Examples

### Add tenant isolation check to multiple services
```
/dev:do-in-parallel audit tenant isolation in every prisma query --files "apps/api/src/catalog/catalog.service.ts apps/api/src/inventory/inventory.service.ts apps/api/src/sales/sales.service.ts"
```

### Add JSDoc to all services
```
/dev:do-in-parallel add JSDoc comments to public methods --files "$(find apps/api/src -name '*.service.ts' | grep -v spec | tr '\n' ' ')"
```

### Write tests for changed files
```
/dev:do-in-parallel write unit tests following existing test patterns --files "$(git diff --name-only | grep service | tr '\n' ' ')"
```

### Security audit multiple modules
```
/dev:do-in-parallel check for OWASP Top 10 vulnerabilities --targets "auth catalog payments inventory"
```
