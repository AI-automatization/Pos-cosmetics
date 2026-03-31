---
description: Security rules applied to all RAOS code
---

# RAOS Security Rules

## Authentication
- JWT: Access token (15min) + Refresh token (7d, httpOnly cookie)
- Password: bcrypt (12 rounds minimum)
- PIN: 4-6 digit, bcrypt hashed, 5 attempts then lock

## Authorization
- Role hierarchy: OWNER(5) > ADMIN(4) > MANAGER(3) > CASHIER(2) > VIEWER(1)
- Guards order: JwtAuthGuard → RolesGuard → TenantGuard
- @Public() decorator skips auth
- @Roles() decorator enforces RBAC

## Multi-tenant isolation
- `tenant_id` HAR query da filter — MAJBURIY
- tenant_id siz query = DATA LEAK

## Input validation
- Backend: class-validator
- Frontend/Mobile: zod
- SQL injection: Prisma ORM (parametrized queries only)

## Secrets
- HECH QACHON kodga yozma — faqat .env
- Sensitive data log da [REDACTED]: password, token, secret, authorization

## Immutable data
- Ledger entry: UPDATE/DELETE TAQIQLANGAN — faqat REVERSAL
- Fiscal receipt: o'zgartirib BO'LMAYDI — snapshot saqlanadi
