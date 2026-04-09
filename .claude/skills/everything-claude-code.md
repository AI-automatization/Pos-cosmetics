---
name: everything-claude-code
description: Meta-skill for optimizing Claude Code workflows. Provides guidance on hooks, agents, rules, settings, and best practices for maximizing Claude Code productivity in the RAOS project.
argument-hint: what to optimize (hooks/agents/rules/settings/workflow)
---

# Everything Claude Code — Optimization Guide

Comprehensive Claude Code optimization for the RAOS monorepo.

## User Arguments

```
$ARGUMENTS
```

- `hooks` — Review and optimize `.claude/settings.json` hooks
- `agents` — Review and optimize `.claude/agents/` agent definitions
- `rules` — Review CLAUDE.md and role-specific rules
- `settings` — Optimize Claude Code settings
- `workflow` — General workflow optimization tips

## RAOS Claude Code Structure

```
.claude/
  settings.json          ← Permissions, MCP servers, hooks
  settings.local.json    ← Local overrides (not committed)
  agents/                ← 11 specialized subagents
    session-start.md
    orchestrator.md
    conflict-resolver.md
    type-fixer.md
    tasks-done-sync.md
    component-builder.md
    api-integrator.md
    frontend-reviewer.md
    type-checker.md
    task-tracker.md
    ...
  skills/                ← This directory — skills
CLAUDE.md               ← Main project rules
CLAUDE_FULLSTACK.md     ← Ibrat's zone rules
```

## Hooks Optimization

Hooks run shell commands on events. Current RAOS uses:

```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Stop": [...]
  }
}
```

**Useful RAOS hooks:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "echo 'Running bash command...' >&2"
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "cd /c/Users/asus/Desktop/Pos-cosmetics && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20 || true"
        }]
      }
    ]
  }
}
```

## Agent Best Practices

Good agent definition structure:
```markdown
---
name: agent-name
description: One-line purpose — triggers when...
---

# Agent Name

## When to Use
- Trigger condition 1
- Trigger condition 2

## Instructions
Step-by-step what the agent does

## Output Format
What the agent returns
```

**Current RAOS agents review:**

| Agent | Purpose | Use When |
|-------|---------|---------|
| session-start | Project status check | Every new session |
| orchestrator | Task coordination | Planning work |
| conflict-resolver | Git merge conflicts | <<<<<<< markers seen |
| type-fixer | TypeScript errors | tsc errors, T-229/T-230 |
| tasks-done-sync | Tasks.md sync | After commits |
| component-builder | React components | New UI needed |
| api-integrator | API hooks | New endpoint |
| frontend-reviewer | Code review | Before commit |
| type-checker | Type errors | Before push |
| task-tracker | Task management | Bug found |

## CLAUDE.md Rules Effectiveness

For rules to be effective:
- Be specific, not general ("use Prisma parameterized queries" not "be secure")
- Include examples of WRONG and RIGHT patterns
- Explain WHY, not just WHAT
- Keep rules focused on your actual stack

## Skills to Enable for RAOS

Now available in `.claude/skills/`:

| Skill | Command | Use When |
|-------|---------|---------|
| code-auditor | `/code-auditor apps/api/src/catalog` | Module audit |
| review-local-changes | `/review-local-changes` | Before commit |
| review-pr | `/review-pr 123` | PR review |
| write-tests | `/write-tests` | After feature work |
| fix-tests | `/fix-tests` | CI failures |
| webapp-testing | `/webapp-testing http://localhost:3001` | UI testing |
| root-cause-tracing | `/root-cause-tracing` | P0 bugs |
| changelog-generator | `/changelog-generator last week` | Release notes |
| architecture-diagram | `/architecture-diagram payment flow` | Documentation |
| mcp-builder | `/mcp-builder RAOS Prisma MCP` | New MCP server |

## Workflow Optimization Tips

1. **Session start**: Always run `session-start` agent first
2. **Before commit**: Run `/review-local-changes --min-impact high`
3. **After feature**: Run `/write-tests` to add coverage
4. **P0 bugs**: Use `/root-cause-tracing` methodology
5. **Module audit**: Run `/code-auditor apps/api/src/[module]` monthly
6. **Releases**: Run `/changelog-generator` before tagging

## Common RAOS Patterns

### Correct NestJS pattern
```typescript
// ✅ Good
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  async createOrder(tenantId: string, dto: CreateOrderDto) {
    this.logger.log('Creating order', { tenantId, dto });
    return this.prisma.order.create({
      data: { ...dto, tenantId },
    });
  }
}
```

### Correct React Query pattern
```typescript
// ✅ Good
export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.list(filters),
  });
}
```
