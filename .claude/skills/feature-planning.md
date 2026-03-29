---
name: dev:feature-planning
description: Break down feature requests into detailed implementation plans with file paths, line numbers, architecture decisions, dependency analysis, and sequential task ordering. Use before starting any non-trivial feature.
argument-hint: describe the feature to plan
---

# Feature Planning

Transforms feature requests into actionable implementation plans with specific file paths and task sequences.

## User Arguments

```
$ARGUMENTS
```

Describe the feature to plan. Be specific about requirements and constraints.

## Workflow

### Phase 1 — Requirements Clarification

Ask clarifying questions if needed:
- What problem does this solve?
- Who uses this feature (Admin, Cashier, Owner)?
- What are the acceptance criteria?
- Are there performance requirements?
- Any integration with existing modules?

### Phase 2 — Codebase Analysis

Explore existing architecture:
```bash
# Find related files
grep -rn "relatedModule\|relatedService" apps/api/src/ --include="*.ts" -l

# Check existing patterns
ls apps/api/src/[module]/
```

Read key files:
- Existing similar module for patterns
- `prisma/schema.prisma` for data model context
- Relevant DTOs and interfaces
- Existing tests for patterns

### Phase 3 — Architecture Decision

For each layer, determine what's needed:

**Database:**
- New table? New field? New index?
- Impact on existing queries?
- Migration required?

**Backend (NestJS):**
- New module? Or extend existing?
- New service methods?
- New controller endpoints?
- New DTOs?
- New guards/decorators?

**Frontend (Next.js):**
- New page? New component?
- New React Query hook?
- New API client function?

**Types (packages/types/):**
- New shared types needed?
- Breaking changes to existing types?

### Phase 4 — Implementation Plan

Output structured plan:

```markdown
# Feature Plan: [Feature Name]

## Overview
[1-2 sentence description]

## Architecture Decision
[Key design choices and rationale]

## Tasks (in order)

### Task 1: Database Schema
- **File**: `prisma/schema.prisma`
- **Change**: Add `NasiyaPayment` model
- **Lines**: After line 245 (existing Payment model)
- **Migration**: Required — `pnpm --filter api prisma migrate dev`

### Task 2: Create DTO
- **File**: `apps/api/src/nasiya/dto/create-nasiya-payment.dto.ts` (NEW)
- **Content**: CreateNasiyaPaymentDto with class-validator decorators

### Task 3: Service Method
- **File**: `apps/api/src/nasiya/nasiya.service.ts`
- **Method**: `createPayment(tenantId, dto)` after line 89
- **Dependencies**: PrismaService, LedgerService

### Task 4: Controller Endpoint
- **File**: `apps/api/src/nasiya/nasiya.controller.ts`
- **Endpoint**: `POST /nasiya/payments`
- **Guard**: JwtAuthGuard + RolesGuard([ADMIN, CASHIER])

### Task 5: React Query Hook
- **File**: `apps/web/src/hooks/nasiya/useCreateNasiyaPayment.ts` (NEW)
- **Pattern**: Follow `apps/web/src/hooks/sales/useCreateOrder.ts`

### Task 6: UI Component
- **File**: `apps/web/src/app/(admin)/nasiya/NasiyaPaymentForm.tsx` (NEW)
- **Integrates**: useCreateNasiyaPayment hook

### Task 7: Tests
- **File**: `apps/api/src/nasiya/nasiya.service.spec.ts`
- **Cases**: happy path, invalid amount, tenant isolation

## Dependencies
- Task 1 must complete before Task 2-4
- Task 3 must complete before Task 4
- Task 4 must complete before Task 5
- Task 5 must complete before Task 6

## Risks / Edge Cases
- Nasiya amount can be paid in multiple installments — need idempotency key
- WAREHOUSE role must NOT have access to this endpoint

## Estimated Complexity
- Database: Low
- Backend: Medium
- Frontend: Medium
- Tests: Low
- Total: 2-3 hours

## Definition of Done
- [ ] API returns correct data
- [ ] Frontend displays correctly
- [ ] Test coverage > 80%
- [ ] No TypeScript errors
- [ ] Tenant isolation verified
```

### Phase 5 — User Validation

Present plan to user:
- Does this match your expectations?
- Any missing requirements?
- Priority order correct?
- Any technical constraints I missed?

### Phase 6 — Execution

After approval, implement tasks sequentially:
1. Each task = separate commit
2. Run tests after each task
3. Use `/write-tests` after implementation
4. Use `/review-local-changes` before final commit

## RAOS-Specific Checklist

For every new feature, always include:
- [ ] `tenantId` in all new DB tables and queries
- [ ] Input validation with class-validator
- [ ] Auth guard (correct roles)
- [ ] Error handling with NestJS Logger
- [ ] Test for tenant isolation
- [ ] No WAREHOUSE role access to financial data
