---
name: security:best-practices
description: Language and framework-specific security review for TypeScript/NestJS/Next.js. Generates security_best_practices_report.md with findings by severity. Triggers only on explicit security requests.
argument-hint: path or module to review, or "report" to generate full report
---

# Security Best Practices — TypeScript / NestJS / Next.js

Framework-specific security review for the RAOS stack.

## User Arguments

```
$ARGUMENTS
```

- Path: `apps/api/src/auth/` or `apps/web/src/`
- Mode: `report` — generate full `security_best_practices_report.md`
- Specific concern: `jwt`, `cors`, `sql`, `xss`, `auth`

## RAOS Security Stack

| Layer | Framework | Key Concerns |
|-------|-----------|-------------|
| Backend | NestJS + Prisma | Auth guards, tenant isolation, SQL, rate limit |
| Frontend | Next.js | XSS, CSP, env vars, CSRF |
| API Gateway | — | CORS, Helmet, rate limiting |
| Auth | JWT | Algorithm, expiry, refresh token |
| Payments | Plugin-based | Amount validation, idempotency |
| Ledger | Double-entry | Immutability, audit trail |

## NestJS Security Checklist

### Authentication & Authorization
```typescript
// ✅ JWT with explicit algorithm
JwtModule.register({
  secret: configService.get('JWT_SECRET'),
  signOptions: { expiresIn: '15m', algorithm: 'HS256' },
})

// ✅ Guards on every route (default deny)
@UseGuards(JwtAuthGuard, RolesGuard)

// ✅ Role-based
@Roles(Role.ADMIN)

// ✅ Tenant isolation in every query
where: { id, tenantId: user.tenantId }
```

### Input Validation
```typescript
// ✅ class-validator on all DTOs
@IsString()
@IsNotEmpty()
@MaxLength(255)
name: string;

// ✅ Global ValidationPipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // strip unknown properties
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### Rate Limiting
```typescript
// ✅ Throttler on sensitive endpoints
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
```

### Security Headers (Helmet)
```typescript
// ✅ in main.ts
app.use(helmet());
app.enableCors({
  origin: configService.get('ALLOWED_ORIGINS').split(','),
  credentials: true,
});
```

## Next.js Security Checklist

### XSS Prevention
```typescript
// ✅ Never use dangerouslySetInnerHTML with user data
// ✅ Sanitize with DOMPurify if HTML rendering needed
// ✅ Use Content Security Policy headers
```

### Environment Variables
```typescript
// ✅ Server-only secrets (no NEXT_PUBLIC_ prefix)
process.env.DATABASE_URL     // ✅ server only
process.env.NEXT_PUBLIC_API  // ⚠️ exposed to browser — never put secrets here
```

### API Routes
```typescript
// ✅ Validate session on every API route
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ...
}
```

## Common RAOS Vulnerabilities to Check

```bash
# 1. Missing tenant isolation
grep -rn "prisma\.\w\+\.find" apps/api/src/ --include="*.ts" | grep -v "tenantId"

# 2. Missing auth guards
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch" apps/api/src/ --include="*.ts" -l

# 3. Raw SQL (SQL injection risk)
grep -rn "\$queryRaw\|\$executeRaw" apps/api/src/ --include="*.ts"

# 4. Secrets in code
grep -rn "secret.*=.*['\"][A-Za-z0-9]\|key.*=.*['\"][A-Za-z0-9]\|password.*=.*['\"]" apps/ --include="*.ts" | grep -v "\.spec\.\|test\."

# 5. Missing rate limiting on auth endpoints
grep -rn "login\|register\|forgot-password\|reset-password" apps/api/src/ -l --include="*.ts"
```

## Report Output

When generating full report, save as `security_best_practices_report.md`:

```markdown
# Security Best Practices Report — RAOS
Generated: YYYY-MM-DD

## Executive Summary
- Critical: N
- High: N
- Medium: N
- Low: N

## Findings

### [SEC-001] Missing tenant isolation — HIGH
- **File**: apps/api/src/catalog/catalog.service.ts:45
- **Code**: `this.prisma.product.findMany({ where: { id } })`
- **Fix**: Add `tenantId: user.tenantId` to where clause

### [SEC-002] ...
```

## Fix Guidelines

- Fix one finding at a time
- Never break existing functionality
- Add regression test for each security fix
- Document exceptions in code comments if intentional bypass
