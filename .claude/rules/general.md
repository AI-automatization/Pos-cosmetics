---
description: Core coding principles for all RAOS developers
---

# RAOS General Rules

## SOLID
- **S** — Har fayl BIR vazifa. Controller = HTTP. Service = logika.
- **O** — Mavjud kodni o'zgartirma → kengaytir (strategy, decorator, plugin)
- **L** — Interface va'da qilganini bajar
- **I** — Kichik, aniq interfeys. "God object" TAQIQLANGAN
- **D** — Service → Abstract interfeys ga bog'lanish

## DRY + KISS
- Bir xil kod 2+ joyda → helper/hook/service ga chiqar
- Murakkab yechimdan oldin oddiy yechimni sinab ko'r

## Taqiqlangan
- `any` type — TypeScript strict mode
- `console.log` — Backend: NestJS Logger, Frontend: faqat DEV mode
- 400+ qatorli fayl — bo'lish kerak (SRP)
- Inline styles — Tailwind class ishlatish
- Magic numbers — const bilan nomlash
- Hardcoded secrets — .env ishlatish
- Boshqa modul jadvaliga direct query

## Task tracking
- Bug topilsa → `docs/Tasks.md` ga darhol yoz
- Fix bo'lsa → `docs/Done.md` ga ko'chir
