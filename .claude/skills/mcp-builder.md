---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable Claude to interact with external services through well-designed tools. Use when building custom MCP integrations for RAOS.
argument-hint: describe the MCP server to build (e.g., "RAOS Prisma MCP", "tenant audit log MCP")
---

# MCP Builder

Guide for creating high-quality MCP servers for Claude Code integration.

## User Arguments

```
$ARGUMENTS
```

Describe the MCP server to build — what external service or capability it exposes.

## When to Use

- Integrating a new external API into Claude's workflow
- Exposing RAOS backend data to Claude (read-only)
- Building custom tools for specific RAOS workflows
- Adding database inspection capabilities

## MCP Server Types

### TypeScript (Recommended for RAOS)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'raos-mcp',
  version: '1.0.0',
});

// Define a tool
server.tool(
  'get_tenant_info',
  'Get information about a tenant by ID',
  {
    tenantId: z.string().describe('The tenant UUID'),
  },
  async ({ tenantId }) => {
    // Implementation
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Python (FastMCP)

```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

mcp = FastMCP("raos-mcp")

@mcp.tool()
def get_tenant_info(tenant_id: str) -> dict:
    """Get information about a tenant by ID"""
    # Implementation
    return {"tenant_id": tenant_id, "name": "..."}

if __name__ == "__main__":
    mcp.run()
```

## Design Principles

### Agent-Centric Design
Design tools as if instructing a capable colleague:
- Clear, descriptive tool names (`get_low_stock_products` not `query_db`)
- Rich descriptions explaining when to use each tool
- Explicit parameter descriptions with valid ranges/examples
- Meaningful error messages with fix suggestions

### Input Validation
```typescript
// TypeScript with Zod
{
  tenantId: z.string().uuid().describe('Tenant UUID'),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
  limit: z.number().int().min(1).max(100).default(20),
}
```

### Read-Only vs Write Tools
- Prefer read-only tools for safety
- Write tools must confirm intent
- Destructive operations require explicit confirmation parameter

## RAOS-Specific MCP Ideas

### 1. RAOS Prisma Inspector (Read-Only)
```typescript
// Tools:
// - get_schema() → Prisma schema overview
// - query_products(tenantId, filters) → product list
// - get_inventory_levels(tenantId, warehouseId?) → stock levels
// - get_recent_orders(tenantId, limit) → recent sales
// - get_audit_log(tenantId, userId?, action?) → audit entries
```

### 2. RAOS Analytics MCP
```typescript
// Tools:
// - get_sales_summary(tenantId, period) → revenue metrics
// - get_top_products(tenantId, limit) → bestsellers
// - get_low_stock_alert(tenantId) → items below threshold
// - get_dead_stock(tenantId, days) → items with no movement
```

### 3. RAOS Task MCP
```typescript
// Tools:
// - list_open_tasks() → docs/Tasks.md contents
// - add_task(title, priority, category) → add to Tasks.md
// - complete_task(taskId) → move to Done.md
```

## Installation in Claude Code

Add to `.claude/settings.json`:
```json
{
  "mcpServers": {
    "raos-mcp": {
      "command": "node",
      "args": ["./mcp-servers/raos-mcp/dist/index.js"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

## Project Structure

```
mcp-servers/
  raos-prisma/
    src/
      index.ts        ← MCP server entry
      tools/
        products.ts   ← Product tools
        inventory.ts  ← Inventory tools
      utils/
        prisma.ts     ← Prisma client (read-only)
    package.json
    tsconfig.json
```

## Testing Your MCP Server

```bash
# Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js

# Or test directly
echo '{"method":"tools/list"}' | node dist/index.js
```

## Security Notes for RAOS

- Never expose write operations without explicit confirmation
- Always scope queries to a specific `tenantId`
- Use read-only database user for Prisma connection
- Never expose `prisma.$executeRaw` or `$queryRaw` directly
- Rate-limit expensive queries
