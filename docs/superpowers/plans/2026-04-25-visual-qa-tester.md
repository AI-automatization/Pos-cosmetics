# Visual QA Tester Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** RAOS Web Admin va POS uchun `/visual-qa-tester` skill yaratish — Playwright orqali avtomatik UI test, natijalar `docs/Tasks.md` va Obsidian ga yoziladi, bug fix bo'lganda Obsidian checkboxlari avtomatik yangilanadi.

**Architecture:** `~/.claude/skills/visual-qa-tester/SKILL.md` skill fayli yaratiladi. Mavjud `tasks-done-sync` agentga Obsidian checkbox sync qadami qo'shiladi. Obsidian vault: `/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports/`.

**Tech Stack:** Playwright MCP (mavjud), Claude Code skills system, Bash (fayl operatsiyalari)

---

## Chunk 1: Obsidian RAOS papkasini yaratish

### Task 1: Obsidian PROJECTS/RAOS/qa-reports papkasini yaratish

**Files:**
- Create: `/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports/.gitkeep`

- [ ] **Step 1: Papkani yaratish**

```bash
mkdir -p "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports"
```

- [ ] **Step 2: Index fayl yaratish**

`/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports/README.md` ga yoz:

```markdown
# RAOS QA Reports

Visual QA Tester tomonidan avtomatik yaratilgan hisobotlar.

## Format
- `YYYY-MM-DD-web-qa.md` — Web Admin Panel audit
- `YYYY-MM-DD-pos-qa.md` — POS Desktop audit

## Status
- `- [ ]` — Ochiq bug
- `- [x]` — Fix qilingan bug
```

- [ ] **Step 3: Tekshirish**

```bash
ls "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports/"
```

Expected: `README.md` ko'rinsin

---

## Chunk 2: Visual QA Tester Skill yaratish

### Task 2: `~/.claude/skills/visual-qa-tester/SKILL.md` yaratish

**Files:**
- Create: `~/.claude/skills/visual-qa-tester/SKILL.md`

- [ ] **Step 1: Skills papkasini yaratish**

```bash
mkdir -p ~/.claude/skills/visual-qa-tester
```

- [ ] **Step 2: SKILL.md yaratish**

`~/.claude/skills/visual-qa-tester/SKILL.md` ga quyidagi to'liq contentni yoz:

````markdown
---
name: visual-qa-tester
description: RAOS Web Admin va POS uchun Playwright orqali vizual QA testi. Topilgan buglar docs/Tasks.md va Obsidian qa-reports ga yoziladi.
---

# Visual QA Tester — RAOS

## Komanda formati

```
/visual-qa-tester web              # Barcha web sahifalar (localhost:3001)
/visual-qa-tester pos              # POS (localhost:1420 yoki tauri dev)
/visual-qa-tester web login        # Faqat login sahifa
/visual-qa-tester web /admin       # Muayyan route
```

## Argumentlarni parse qilish

Args dan:
1. Birinchi arg = target: `web` yoki `pos`
2. Ikkinchi arg (ixtiyoriy) = sahifa nomi yoki route

## Target konfiguratsiya

| Target | URL | Tavsif |
|--------|-----|--------|
| `web` | `http://localhost:3001` | Next.js Admin Panel |
| `pos` | `http://localhost:1420` | POS Desktop (Tauri dev) |

## Test jarayoni (MAJBURIY tartib)

### 1. Server tekshiruv

```bash
# Web uchun
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null
# POS uchun
curl -s -o /dev/null -w "%{http_code}" http://localhost:1420 2>/dev/null
```

Agar 200 emas → foydalanuvchiga xabar ber: "Server ishlamayapti. `pnpm --filter {target} dev` buyrug'ini ishga tushiring."

### 2. Playwright orqali test

Playwright MCP ishlatib quyidagi amallarni bajaring:

**Har sahifada:**
1. `browser_navigate` — sahifaga o'tish
2. `browser_take_screenshot` — screenshot olish
3. `browser_snapshot` — accessibility tree olish
4. `browser_console_messages` — console xatolarni olish
5. `browser_network_requests` — 4xx/5xx xatolarni tekshirish

**Tekshiriladigan narsalar:**

| # | Kategoriya | Nima tekshiriladi |
|---|-----------|-------------------|
| 1 | A11y | `<label>` htmlFor, form field id/name, ARIA roles, contrast |
| 2 | Console | Error, warning xabarlar |
| 3 | Network | 4xx, 5xx javoblar |
| 4 | UI/UX | Bo'sh holat, loading state, error state |
| 5 | Terminologiya | Inglizcha so'zlar O'zbek UX da |
| 6 | Responsive | Element kesilishi, overflow |
| 7 | Form | Validation xabarlari, required field belgilari |
| 8 | Navigation | Broken link, 404 route |

### 3. Bug kategoriyalash

Har bug uchun:
- 🔴 Critical (P0) — Funksiya ishlamaydi, crash, data yo'qolishi
- 🟠 High (P1) — Muhim feature buzilgan, foydalanish qiyin
- 🟡 Medium (P2) — UI/UX muammo, a11y
- 🔵 Low (P3) — Kosmetik, terminologiya

### 4. docs/Tasks.md ga yozish

RAOS loyiha papkasiga o'tib Tasks.md ni o'qi. So'nggi T-raqamni aniqlash:

```bash
cd /Users/mrz0101aicloud.com/Desktop/untitled\ folder\ 5/Pos-cosmetics
grep "^## T-" docs/Tasks.md | tail -5
```

Har bug uchun yangi T-raqam bilan quyidagi formatda yoz:

```markdown
## T-XXX | P{priority} | [FRONTEND] | {target_upper} — {sahifa}: {muammo qisqacha}

- **Sana:** {YYYY-MM-DD}
- **Mas'ul:** Ibrat
- **Fayl:** {tegishli fayl yoli}
- **Muammo:** {batafsil tavsif}
- **Kutilgan:** {nima bo'lishi kerak}
- **Topildi:** Visual QA (Playwright) — {YYYY-MM-DD}

---
```

**MUHIM:** Tasks.md statistika jadvalini ham yangilash:
- Yangi bug sonini mos P0/P1/P2/P3 ustuniga qo'sh
- `[FRONTEND]` qatorini yangilash
- Ibrat qatorini yangilash
- Jami sonni yangilash
- `> Yangilandi: {sana}` qatorini yangilash

### 5. Obsidian ga QA report saqlash

Fayl joyi: `/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports/`
Fayl nomi: `{YYYY-MM-DD}-{target}-qa.md`

Format:

```markdown
# QA Report — {Target} | {YYYY-MM-DD}

**Test qilingan:** {URL}
**Topilgan buglar:** {jami soni}

---

## 🔴 Critical (P0)
{agar yo'q → `*(yo'q)*`}
- [ ] T-XXX — {sahifa}: {muammo qisqacha}

## 🟠 High (P1)
- [ ] T-XXX — {sahifa}: {muammo qisqacha}

## 🟡 Medium (P2)
- [ ] T-XXX — {sahifa}: {muammo qisqacha}

## 🔵 Low (P3)
- [ ] T-XXX — {sahifa}: {muammo qisqacha}

---

## Console Xatolar

```
{console error/warning ro'yxati yoki "Xato yo'q"}
```

## Network Xatolar

{4xx/5xx ro'yxati yoki "Xato yo'q"}

---

*Visual QA Tester tomonidan avtomatik yaratildi*
```

### 6. Hisobot chiqarish

Testdan so'ng quyidagi formatda xulosa ber:

```
✅ Visual QA Test tugadi — {target} | {YYYY-MM-DD}

📊 Natijalar:
  🔴 Critical (P0): X ta
  🟠 High (P1):     X ta
  🟡 Medium (P2):   X ta
  🔵 Low (P3):      X ta
  📋 Jami: X ta bug

📁 Saqlandi:
  → docs/Tasks.md (T-XXX..T-YYY)
  → Obsidian: PROJECTS/RAOS/qa-reports/{fayl-nomi}.md

⚡ Eng kritik bug: {🔴 bug sarlavhasi}
```

## Qoidalar

- Server ishlamasa — test qilma, foydalanuvchiga aytib to'xta
- Bir sahifada 10+ bug topilsa — eng muhim 5 tasini yoz, qolganlari uchun "va boshqa {N} ta muammo" de
- Tasks.md T-raqamlarini ketma-ket davom ettir (oxirgi T-raqam + 1 dan boshlash)
- Obsidian faylini overwrite qilma — agar bugungi fayl allaqachon bor bo'lsa, nomga `-2` qo'sh
- Screenshot olish Playwright MCP orqali
````

- [ ] **Step 3: Fayl yaratilganini tekshirish**

```bash
ls -la ~/.claude/skills/visual-qa-tester/
wc -l ~/.claude/skills/visual-qa-tester/SKILL.md
```

Expected: `SKILL.md` 100+ qator

---

## Chunk 3: tasks-done-sync agentni yangilash

### Task 3: Obsidian checkbox sync qadamini qo'shish

**Files:**
- Modify: `.claude/agents/tasks-done-sync.md`

- [ ] **Step 1: Mavjud agentni o'qish**

Fayl: `.claude/agents/tasks-done-sync.md` — oxirgi `## 7-qadam: Commit` bo'limini ko'rish.

- [ ] **Step 2: Yangi qadam qo'shish**

`## 7-qadam: Commit` bo'limidan OLDIN yangi qadam qo'shish:

```markdown
## 6.5-qadam: Obsidian QA Report checkboxlarini yangilash

Agar bajarilgan T-raqamlar Visual QA tomonidan topilgan bo'lsa (Tasks.md da `**Topildi:** Visual QA` yozuvi bor edi), Obsidian QA report fayllarida checkboxlarni yangilash.

```bash
# QA report papkasini tekshir
QA_DIR="/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports"
ls "$QA_DIR" 2>/dev/null || echo "QA reports yo'q — skip"
```

Agar papka mavjud va `.md` fayllar bor bo'lsa, har bajarilgan T-raqam uchun:

```bash
# Barcha QA report fayllarida - [ ] T-XXX → - [x] T-XXX
for f in "$QA_DIR"/*.md; do
  sed -i '' "s/- \[ \] T-XXX/- [x] T-XXX/g" "$f"
done
```

**Muhim:** `T-XXX` o'rniga haqiqiy T-raqamni ishlatish. Misol T-346 uchun:

```bash
for f in "$QA_DIR"/*.md; do
  sed -i '' "s/- \[ \] T-346/- [x] T-346/g" "$f"
done
```

Agar QA report fayllari yo'q → bu qadamni skip qil.

---
```

- [ ] **Step 3: Hisobot formatini yangilash**

`## Hisobot formati` bo'limida `✅ Done.md ga ko'chirildi` qismidan keyin Obsidian satri qo'shish:

```markdown
🔄 Obsidian checkboxlar yangilandi:
- T-XXX: - [ ] → - [x] (yoki "QA report yo'q — skip")
```

- [ ] **Step 4: Commit**

```bash
cd /Users/mrz0101aicloud.com/Desktop/untitled\ folder\ 5/Pos-cosmetics
git add .claude/agents/tasks-done-sync.md
git commit -m "feat(agents): tasks-done-sync — Obsidian QA checkbox sync qo'shildi"
```

---

## Chunk 4: Skill ro'yxatdan o'tkazish va sinash

### Task 4: Claude settings.json ga skill qo'shish

**Files:**
- Modify: `~/.claude/settings.json`

- [ ] **Step 1: Hozirgi settings ni o'qish**

```bash
cat ~/.claude/settings.json
```

- [ ] **Step 2: `skills` papkasi mavjudligini tekshirish**

```bash
ls ~/.claude/skills/
```

Expected: `visual-qa-tester` ko'rinsin

- [ ] **Step 3: Sinov — skill fayl to'g'ri joydami**

```bash
cat ~/.claude/skills/visual-qa-tester/SKILL.md | head -5
```

Expected: `name: visual-qa-tester` ko'rinsin

### Task 5: Sinov testi

- [ ] **Step 1: Web server ishlamoqdami tekshirish**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "Server ishlamayapti"
```

- [ ] **Step 2: Obsidian papkasi to'g'ri joydami**

```bash
ls "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/qa-reports/"
```

Expected: `README.md` ko'rinsin

- [ ] **Step 3: Yakuniy commit**

```bash
cd /Users/mrz0101aicloud.com/Desktop/untitled\ folder\ 5/Pos-cosmetics
git log --oneline -3
```

---

## Bajarilganlik mezonlari

- [ ] `~/.claude/skills/visual-qa-tester/SKILL.md` mavjud
- [ ] Obsidian `PROJECTS/RAOS/qa-reports/README.md` mavjud
- [ ] `tasks-done-sync.md` da `6.5-qadam` qo'shilgan
- [ ] `/visual-qa-tester web` komandasi ishga tushsa serverni tekshiradi
- [ ] Bug topilsa Tasks.md ga T-raqam bilan yozadi
- [ ] Obsidian ga `YYYY-MM-DD-web-qa.md` saqlaydi
