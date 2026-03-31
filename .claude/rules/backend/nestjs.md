---
description: NestJS backend rules for RAOS API
paths:
  - "apps/api/**/*.ts"
  - "apps/worker/**/*.ts"
---

# NestJS Rules

## Controller = HTTP ONLY
- Biznes logika YO'Q — faqat Service chaqirish
- @CurrentTenant() decorator bilan tenant_id olish
- Response shape: `{ data, meta?, error? }`

## Service layer
- Barcha biznes logika shu yerda
- HAR method da tenant_id parameter — MAJBURIY
- NestJS Logger ishlatish (`private readonly logger = new Logger(MyService.name)`)
- console.log TAQIQLANGAN

## Error handling
- NestJS Exceptions ishlatish (BadRequestException, NotFoundException, etc.)
- Error yutilmasin — Logger + proper exception throw
- Global exception filter avtomatik ishlaydi

## Domain events
- Modul aro aloqa: EventEmitter orqali (`@OnEvent`)
- Boshqa modul jadvaliga DIRECT QUERY TAQIQLANGAN
- Event log ga yozish (immutable)

## N+1 prevention
- `include` ishlatish — loop ichida query qilma
- Aggregate uchun Prisma `_count`, `_sum` ishlatish

## BigInt serialization
- `id.toString()` — JSON serialize uchun
- BigIntSerializerInterceptor global da ishlaydi
