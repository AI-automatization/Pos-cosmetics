# Visual QA Tester — RAOS Design Spec

**Sana:** 2026-04-25
**Muallif:** Abdulaziz + Claude
**Holat:** Tasdiqlangan

---

## Maqsad

RAOS Web Admin Panel (`apps/web`) va POS Desktop (`apps/pos`) uchun Playwright orqali avtomatik vizual QA. Topilgan buglar `docs/Tasks.md` va Obsidian vault ga yoziladi. Bug fix bo'lganda `tasks-done-sync` agent Obsidian checkboxlarini avtomatik yangilaydi.

---

## Arxitektura

### Fayl tuzilishi

```
~/.claude/skills/visual-qa-tester/
└── SKILL.md                    ← Asosiy skill

RAOS loyihasi:
~/.claude/agents/
└── tasks-done-sync.md          ← Obsidian sync qismi qo'shiladi

Obsidian:
ClaudeVault/01-Projects/RAOS/qa-reports/
└── YYYY-MM-DD-{target}-qa.md
```

### Komandalar

```bash
/visual-qa-tester web           # apps/web — barcha sahifalar (localhost:3001)
/visual-qa-tester pos           # apps/pos — barcha sahifalar
/visual-qa-tester web login     # faqat login sahifa
/visual-qa-tester web /admin    # muayyan route
```

---

## Test Jarayoni

```
1. Playwright localhost ga ulanadi
2. Barcha route larni aylanadi
3. Har sahifada:
   a. Screenshot oladi
   b. Console xatolarini yig'adi (error, warning)
   c. A11y muammolarini tekshiradi (label, htmlFor, contrast, ARIA)
   d. UI/UX kamchiliklarni aniqlaydi
4. Bug ro'yxat tuzadi (🔴🟠🟡🔵)
5. docs/Tasks.md ga T-raqam bilan yozadi
6. Obsidian ga QA report saqlaydi
```

---

## Bug Format

### docs/Tasks.md

```markdown
## T-XXX | P0 | [FRONTEND] | Web Admin — {sahifa}: {muammo qisqacha}

- **Sana:** 2026-04-25
- **Mas'ul:** Ibrat
- **Fayl:** apps/web/src/app/(auth)/login/page.tsx
- **Muammo:** `<label>` htmlFor bog'lanmagan — a11y xato
- **Kutilgan:** Form fieldlari to'g'ri label bilan bog'langan bo'lsin
- **Topildi:** Visual QA (Playwright) — 2026-04-25
```

### Obsidian (ClaudeVault/01-Projects/RAOS/qa-reports/YYYY-MM-DD-web-qa.md)

```markdown
# QA Report — Web Admin | 2026-04-25

## 🔴 Critical (P0)
- [ ] T-XXX — Login form label yo'q

## 🟠 High (P1)
- [ ] T-XXX — ...

## 🟡 Medium (P2)
- [ ] T-XXX — ...

## 🔵 Low (P3)
- [ ] T-XXX — ...

## Screenshots
![[screenshot-login-2026-04-25.png]]
```

### Prioritet Mapping

| Belgisi | RAOS Priority | Ma'nosi |
|---------|--------------|---------|
| 🔴 Critical | P0 | Darhol tuzatish |
| 🟠 High | P1 | 1 kun |
| 🟡 Medium | P2 | 3 kun |
| 🔵 Low | P3 | Sprint rejasi |

---

## Bug Fix Sync Oqimi

```
1. Dasturchi fix qiladi
2. git commit: "fix(web): T-XXX login form label"
3. tasks-done-sync agent ishlaydi:
   a. Tasks.md dan T-XXX ni o'chiradi
   b. Done.md ga ko'chiradi
   c. Obsidian QA report da:
      - [ ] T-XXX → - [x] T-XXX ✓
```

---

## O'zgartiriluvchi Fayllar

| Fayl | Amal |
|------|------|
| `~/.claude/skills/visual-qa-tester/SKILL.md` | Yangi yaratiladi |
| `~/.claude/agents/tasks-done-sync.md` | Obsidian checkbox sync qo'shiladi |
| `docs/Tasks.md` | Bug tasklar yoziladi (runtime) |

---

## Scope Chegaralari

- Faqat qo'lda ishga tushiriladi (`/visual-qa-tester` komandasi)
- Git hook yoki cron yo'q
- Telegram notification yo'q (keyingi versiya)
- Mobile app (`apps/mobile`) yo'q (keyingi versiya)
