# Lead Agents — AbdulazizYormatov (Team Lead)

Agentlar faqat Team Lead roli uchun. Code review, arxitektura tekshiruv, jamoa monitoring.

---

## Ishlatish tartibi

```
Sessiya boshi:
  → lead-session-start        (pull + tahlil + reja)

Kunlik ish:
  → team-dashboard             (jamoa holati, standup uchun)
  → pr-reviewer                (PR review — har qanday zona)
  → backend-reviewer           (Ibrat kodi — chuqur NestJS review)
  → schema-reviewer            (prisma schema/migration o'zgarsa)

Haftalik:
  → security-auditor           (xavfsizlik audit)
  → architecture-guard         (arxitektura qoidalari tekshiruv)
```

## Agentlar

| Agent | Vazifa | Tools |
|-------|--------|-------|
| `lead-session-start` | Pull + jamoa tahlili + agent tavsiyalari | Read, Glob, Grep, Bash |
| `pr-reviewer` | Universal PR review (backend/frontend/mobile) | Read, Glob, Grep, Bash |
| `backend-reviewer` | NestJS deep review (SOLID, security, tenant) | Read, Glob, Grep, Bash |
| `architecture-guard` | Modul chegaralari, domain events, ledger | Read, Glob, Grep, Bash |
| `team-dashboard` | Jamoa statistikasi (git log, tasks, blokers) | Read, Glob, Grep, Bash |
| `security-auditor` | OWASP Top 10, secrets, auth, tenant isolation | Read, Glob, Grep, Bash |
| `schema-reviewer` | Prisma schema + migration xavfsizligi | Read, Glob, Grep, Bash |

## Qoidalar

- Bu agentlar BARCHA zonalarni ko'radi (backend, frontend, mobile, shared)
- Ibrat va Abdulaziz agentlari faqat O'Z zonasini ko'radi
- Lead agentlari KOD YOZMAYDI — faqat tahlil va tavsiya beradi
- Topilgan muammolar → `docs/Tasks.md` ga task sifatida yoziladi
