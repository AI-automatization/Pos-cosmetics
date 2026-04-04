---
name: review-pr
description: Multi-agent PR review system with specialized reviewers, inline GitHub comments, and automatic PR description generation. Use when reviewing a pull request before merge.
argument-hint: PR number or branch name, optional focus areas, --min-impact critical|high|medium|low (default: high)
---

# Review Pull Request

Multi-agent PR review with specialized reviewers, inline comments, and automatic PR description generation.

## User Arguments

```
$ARGUMENTS
```

- PR number (e.g., `123`) or branch name
- Optional focus areas: security, performance, bugs, quality
- `--min-impact`: Filter threshold — critical/high/medium/medium-low/low (default: high)

## Three-Phase Workflow

### Phase 1 — Preparation

1. **Check PR eligibility**:
   - Run `gh pr view $PR_NUMBER` to get PR details
   - Get the diff: `gh pr diff $PR_NUMBER`
   - List changed files: `gh pr view $PR_NUMBER --json files`

2. **Identify guidelines**:
   - Read CLAUDE.md for project conventions
   - Read README.md for context
   - Check existing test patterns

3. **Launch summary agents** (parallel):
   - One haiku agent per changed file to summarize what changed

### Phase 2 — Issue Detection (Parallel Agents)

Launch up to 6 specialized agents in parallel:

**1. security-auditor** — OWASP Top 10, secrets, auth issues
**2. bug-hunter** — Logic errors, null refs, edge cases
**3. code-quality-reviewer** — DRY, complexity, naming, anti-patterns
**4. contracts-reviewer** — API contracts, types, breaking changes
**5. test-coverage-reviewer** — Missing tests, coverage gaps
**6. historical-context-reviewer** — Regression risks, prior bug patterns

### Phase 3 — Scoring, Filtering & Inline Comments

For each issue:
- Assign confidence (0-100) and impact (0-100) scores
- Filter by `--min-impact` + confidence minimums
- Post inline comments on the PR using `gh pr comment` or `gh api`

**Impact levels:**
- Critical: 81-100 (needs ≥50% confidence)
- High: 61-80 (needs ≥65% confidence)
- Medium: 41-60 (needs ≥75% confidence)
- Medium-Low: 21-40 (needs ≥85% confidence)
- Low: 0-20 (needs ≥95% confidence)

## Inline Comment Format

Post line-specific comments using `gh api`:

```
POST /repos/{owner}/{repo}/pulls/{pull_number}/comments
{
  "body": "🔴 **Security**: Unsanitized user input passed to SQL query.\n\n**Evidence**: Line 42 concatenates `req.query.search` directly.\n\n**Fix**: Use Prisma parameterized queries.",
  "path": "apps/api/src/users/users.service.ts",
  "line": 42
}
```

Emoji indicators:
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🔵 Low

## Auto PR Description Update

After review, optionally update PR description with:
- Summary of changes (what & why)
- Test plan checklist
- Breaking changes notice

```bash
gh pr edit $PR_NUMBER --body "$(cat <<'EOF'
## Summary
- [auto-generated from diff analysis]

## Test Plan
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done

## Breaking Changes
[none / describe if any]
EOF
)"
```

## Critical Constraints

- Skip spec/ and reports/ unless explicitly requested
- Post ONLY inline comments — no summary reports
- Avoid noise — comments must provide meaningful value
- Filter out pre-existing issues and linter-catchable problems
- Never report issues in unchanged code lines
