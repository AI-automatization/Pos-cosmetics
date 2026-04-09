---
name: review-local-changes
description: Multi-agent code review system for uncommitted git changes. Launches up to 6 specialized reviewer agents (security, bug, quality, contracts, testing, history) with confidence scoring and false positive filtering.
argument-hint: focus areas (security/performance/etc), --min-impact critical|high|medium|low (default: high), --json for JSON output
---

# Review Local Changes

Multi-agent code review for uncommitted changes using 6 specialized reviewer roles.

## User Arguments

```
$ARGUMENTS
```

- Optional focus areas: security, performance, bugs, quality, contracts, testing
- `--min-impact`: Filter threshold — critical/high/medium/medium-low/low (default: high)
- `--json`: Output as JSON for programmatic consumption

## Three-Phase Workflow

### Phase 1 — Preparation

1. Determine review scope:
   - Run `git diff --stat` to see changed files
   - Run `git diff` to get full diff
   - Run `git status` for untracked files
2. Resolve configuration:
   - Read CLAUDE.md if present
   - Read README.md for project context
   - Identify relevant guidelines and conventions
3. Filter scope: exclude spec/, reports/, generated files

### Phase 2 — Issue Detection (Parallel Agents)

Launch up to 6 specialized agents in parallel, each reviewing the same diff:

**1. security-auditor**
- Check for injection vulnerabilities, XSS, SQL injection
- Auth/authz issues, secrets exposure, OWASP Top 10
- Input validation gaps

**2. bug-hunter**
- Logic errors, null dereferences, off-by-one errors
- Race conditions, unhandled edge cases
- Incorrect assumptions

**3. code-quality-reviewer**
- DRY violations, excessive complexity
- Naming conventions, anti-patterns
- Readability and maintainability issues

**4. contracts-reviewer**
- API contract violations
- Type mismatches, interface inconsistencies
- Breaking changes to public APIs

**5. test-coverage-reviewer**
- Missing tests for new logic
- Insufficient edge case coverage
- Test quality assessment

**6. historical-context-reviewer**
- Check git blame for context
- Previously fixed bugs re-introduced?
- Patterns from recent commit history

### Phase 3 — Confidence & Impact Scoring

For each issue found:
- Assign **confidence score** (0-100): How certain is this a real issue?
- Assign **impact score** (0-100): How serious is the impact?
  - Critical: 81-100
  - High: 61-80
  - Medium: 41-60
  - Medium-Low: 21-40
  - Low: 0-20

Progressive filtering thresholds:
- Critical impact (81-100): ≥50% confidence required
- High impact (61-80): ≥65% confidence required
- Medium impact (41-60): ≥75% confidence required
- Medium-Low impact (21-40): ≥85% confidence required
- Low impact (0-20): ≥95% confidence required

Only report issues that clear BOTH the `--min-impact` threshold AND their confidence minimum.

## Output Format (Markdown default)

```
# Local Changes Review

## Summary
- Files reviewed: N
- Issues found: N (after filtering)
- Min impact filter: high

## 🔴 Critical Issues
### [security-auditor] SQL injection in user search
- **File**: apps/api/src/users/users.service.ts:42
- **Evidence**: Raw string interpolation in query
- **Fix**: Use Prisma parameterized query

## 🟠 High Issues
...
```

## Key Principles

- Prioritize real bugs and security issues over style
- Skip spec/ and reports/ folders by default
- Avoid false positives from linters or pre-existing code
- Focus on pragmatic improvements with clear reasoning
- Do NOT report issues that exist in unchanged code lines
