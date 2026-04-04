---
name: kaizen:root-cause-tracing
description: Use when errors occur deep in execution and you need to trace back to find the original trigger - systematically traces bugs backward through call stack, adding instrumentation when needed, to identify source of invalid data or incorrect behavior
---

# Root Cause Tracing

## Overview

Bugs often manifest deep in the call stack. Your instinct is to fix where the error appears, but that's treating a symptom.

**Core principle:** Trace backward through the call chain until you find the original trigger, then fix at the source.

## When to Use

**Use when:**

- Error happens deep in execution (not at entry point)
- Stack trace shows long call chain
- Unclear where invalid data originated
- Need to find which test/code triggers the problem

## The Tracing Process

### 1. Observe the Symptom
Write down the exact error message and where it appears.

Example: `TypeError: Cannot read property 'id' of undefined at OrderService.createOrder`

### 2. Find Immediate Cause
What code directly causes this?
```typescript
const order = await this.ordersRepo.save({ ...dto, tenantId: tenant.id });
//                                                          ^^^^^^^^^^^
// tenant is undefined here
```

### 3. Ask: What Called This?
Trace up the call chain:
```
OrderService.createOrder(dto)
  → called by OrdersController.create(req)
  → called by HTTP POST /orders
  → tenant comes from req.user.tenant
  → req.user comes from JWT guard
```

### 4. Keep Tracing Up
What value was passed?
- Where does `req.user.tenant` get populated?
- Is the JWT guard attaching tenant correctly?
- Is tenant loaded from DB or just the ID?

### 5. Find Original Trigger
Where did the bad/missing data come from?
- Is there a missing `include: { tenant: true }` in the auth guard?
- Is there a code path that bypasses tenant loading?

## Adding Stack Trace Instrumentation

When you can't trace manually, add temporary instrumentation:

```typescript
// TEMP DEBUG — remove after fix
async function createOrder(dto: CreateOrderDto) {
  const stack = new Error().stack;
  console.error('DEBUG createOrder:', {
    tenantId: dto.tenantId,
    userId: dto.userId,
    stack,
  });
  // ... rest of function
}
```

**Critical:** Use `console.error()` in tests (not logger — may be suppressed)

**Run and capture:**
```bash
pnpm --filter api test 2>&1 | grep 'DEBUG createOrder'
```

## Finding Test Pollution

If something appears during tests but you don't know which test:

```bash
# Run tests one by one to find the polluter
pnpm --filter api test --testPathPattern="orders" 2>&1
```

## Real Example: NestJS Tenant Issue

**Symptom:** `tenant_id` null in DB despite user being logged in

**Trace chain:**
1. `tenant.id` is undefined in OrderService ← immediate cause
2. `req.user.tenant` is undefined ← one level up
3. JwtStrategy returns `{ userId, tenantId }` but NOT `tenant` object ← root cause
4. OrderService expects `req.user.tenant.id` but only gets `req.user.tenantId`

**Fix at source:** Either load tenant in JwtStrategy or change OrderService to use `req.user.tenantId` directly.

**Also add defense-in-depth:**
- Layer 1: JwtStrategy validates tenantId is present
- Layer 2: OrderService guard checks tenant exists
- Layer 3: Prisma schema enforces NOT NULL constraint

## Key Principle

**NEVER fix just where the error appears. Trace back to find the original trigger.**

## Stack Trace Tips

- In tests: Use `console.error()` not logger — logger may be suppressed
- Before operation: Log before the dangerous operation, not after it fails
- Include context: IDs, environment variables, timestamps
- Capture stack: `new Error().stack` shows complete call chain

## After Finding Root Cause

1. Fix at the source
2. Add validation at each intermediate layer (defense-in-depth)
3. Write a regression test that catches the exact scenario
4. Document what caused the issue in the commit message
