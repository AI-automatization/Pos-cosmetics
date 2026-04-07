---
name: token-optimize
description: Audit and optimize Claude context window usage. Use when session feels slow, context is compressing, or before large tasks.
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
---

# Token & Context Optimization — RAOS

Based on research: Shed (compass-soul), Smart Context (joe3112), Context Budgeting (sarielwang93).

## Core Principle

**Tool outputs = 84% of context growth but lowest-value tokens.**
(Lindenbauer et al., NeurIPS 2025). Everything flows from this.

## After Every Tool Call

- **Extract, don't accumulate.** Large output → write key facts to file → raw output disposable
- **"Will I need this verbatim later?"** Almost never. The answer matters, not 500 lines containing it

## Response Sizing

| Input type | Response style |
|---|---|
| Yes/no question | 1 sentence |
| Status check | Result only |
| Simple task | Do it + brief confirm |
| How-to question | Steps, no fluff |
| Complex planning | Structured + detailed |

**Never say:** "Great question!" / "I'd be happy to help!" / "Let me check..."
**Never do:** Restate what user said. Explain trivial operations. Add "Let me know if..."

## Context Loading Rules

- Don't re-read files already in context (CLAUDE.md, rules/ — auto-loaded)
- Don't read entire large files — use `offset`/`limit` or `Grep`
- Batch independent tool calls in single turn
- Use info already in context before reaching for tools
- `output_mode: "files_with_matches"` for Grep when only paths needed
- `docker ps --format "table {{.Names}}\t{{.Status}}"` — limit output width
- `git log -n 5` — always limit

## When Context Reaches ~70%

1. **Mask old tool outputs first** (free, no LLM calls)
2. **Summarize reasoning only as backup** (lossy, costs LLM call)
3. **Never re-summarize a summary** — spawn sub-agent instead
4. **Critical info at start or end, never middle** (positional attention bias)

## Delegation

- Spawn `Agent(subagent_type=Explore)` for broad searches
- Use `run_in_background=true` for independent research
- Agent results summarized → don't pollute main context

## RAOS-Specific Optimizations

- **Prisma schema** (500+ lines): `Grep "model ProductName" prisma/schema.prisma` — don't read whole file
- **CLAUDE.md** (700 lines): already in system context — NEVER re-read
- **rules/** files: path-scoped, only loaded when editing matching files — no waste
- **API routes**: `Grep "Mapped.*route"` on nest output — don't read all controllers
- **Error logs**: `Grep "error" logs/errors-*.log | tail -20` — not full file

## Audit (run with /token-optimize)

1. Count always-loaded context:
   ```bash
   wc -l CLAUDE.md CLAUDE_BACKEND.md CLAUDE_FRONTEND.md CLAUDE_MOBILE.md 2>/dev/null
   find .claude/rules -name "*.md" -exec wc -l {} + 2>/dev/null
   ```
2. Compare: rules approach saves ~95% vs monolithic CLAUDE_*.md
3. Check for files read multiple times this session
4. Report estimated token savings
