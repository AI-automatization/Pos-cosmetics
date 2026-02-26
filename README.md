# 🤖 CLAUDE CLI TIZIMI — Loyiha Shabloni

> VENTRA loyihasida ishlab chiqilgan va 26 ta bug, 4 ta arxitektura tuzatishi,
> 43 ta feature bo'yicha sinovdan o'tgan tizim.

---

## 📦 TARKIB (8 ta fayl)

```
loyiha/
├── CLAUDE.md               ← Asosiy fayl (Claude CLI avtomatik o'qiydi)
├── CLAUDE_BACKEND.md       ← Backend dasturchi qoidalari
├── CLAUDE_FRONTEND.md      ← Frontend dasturchi qoidalari
├── .claude/
│   └── settings.json       ← Permission lar (so'ramasdan ishlash uchun)
├── .mcp.json               ← MCP extensionlar (Playwright, Context7)
└── docs/
    ├── Tasks.md            ← Ochiq vazifalar (bug, feature, task)
    └── Done.md             ← Bajarilgan ishlar arxivi
```

---

## 🚀 O'RNATISH (5 qadam)

### 1. Fayllarni loyiha root ga nusxalash

```bash
# Repo root da:
cp CLAUDE.md /loyiha/CLAUDE.md
cp CLAUDE_BACKEND.md /loyiha/CLAUDE_BACKEND.md
cp CLAUDE_FRONTEND.md /loyiha/CLAUDE_FRONTEND.md
cp -r .claude/ /loyiha/.claude/
cp .mcp.json /loyiha/.mcp.json
mkdir -p /loyiha/docs
cp docs/Tasks.md /loyiha/docs/Tasks.md
cp docs/Done.md /loyiha/docs/Done.md
```

### 2. CLAUDE.md ni loyihaga moslashtirish

Barcha `[PLACEHOLDER]` larni almashtiring:
```
[LOYIHA_NOMI]    → loyiha nomi (masalan: "SellerPro")
[ISM_1]          → backend dasturchi ismi
[ISM_2]          → frontend dasturchi ismi
[ISM_3]          → uchinchi dasturchi (agar bor bo'lsa)
[ROL_1]          → Backend
[ROL_2]          → Frontend
[ROL_3]          → DevOps/Mobile/etc
```

### 3. Settings: dangerouslySkipPermissions (OPTIONAL)

Agar Claude har buyruqda ruxsat so'ramasligi kerak bo'lsa:

```json
// .claude/settings.json ga qo'shing:
{
  "dangerouslySkipPermissions": true,
  "permissions": { ... }
}
```

⚠️ Faqat ishonchli loyihalarda ishlatish!

### 4. MCP extensionlarni sozlash

`.mcp.json` da kerakli extensionlarni qo'shing/olib tashlang.
Windows uchun `cmd` wrapper kerak bo'lishi mumkin:

```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@anthropic-ai/mcp-playwright@latest"]
}
```

### 5. .gitignore ga qo'shish

```gitignore
# Claude CLI
.claude/settings.local.json   # local permissions (commit qilinmasin)
```

`CLAUDE.md`, `CLAUDE_BACKEND.md`, `CLAUDE_FRONTEND.md`, `docs/` → commit qilinadi.

---

## 🧠 TIZIM QANDAY ISHLAYDI

```
Claude CLI terminal ochildi
    ↓
CLAUDE.md avtomatik o'qiladi
    ↓
"Kimligingizni aniqlay olmayman — ismingiz kim?"
    ↓
[Bekzod] → CLAUDE_BACKEND.md o'qiladi
[Sardor] → CLAUDE_FRONTEND.md o'qiladi
    ↓
docs/Tasks.md o'qiladi → T-raqamni davom ettiradi
    ↓
ISH BOSHLAYDI
    ↓
Bug topilsa → docs/Tasks.md ga yozadi
Fix bo'lsa  → docs/Done.md ga ko'chiradi
```

---

## ✨ TIZIM AFZALLIKLARI

| Muammo | Bu tizim yechimi |
|--------|-----------------|
| Dasturchilar bir-birining faylini buzadi | ZONA tizimi — har kim o'z papkasida |
| Bug lar yozilib qolmaydi | Tasks.md — DARHOL yozish MAJBURIY |
| console.log production da | TAQIQLANGAN ro'yxat + Logger standarti |
| any type TypeScript da | TAQIQLANGAN + strict mode |
| Merge conflict packages/ da | SHARED FILE PROTOCOL — kelishib o'zgartirish |
| Main ga xato push qilinadi | Branch protection + CI checks |
| Yangi developer tez kirishi kerak | CLAUDE.md → CLAUDE_[ROL].md → avtomatik kontekst |
| Nima qilindi nima qoldi bilish | Tasks.md + Done.md — real-time tracking |

---

## 🔧 KENGAYTIRISH

### Yangi rol qo'shish (masalan Mobile dev)

1. `CLAUDE_MOBILE.md` yarating (Backend/Frontend shablonidan nusxa)
2. `CLAUDE.md` da ro'yxatga qo'shing:
   ```
   3. [ISM_3] (Mobile) → CLAUDE_MOBILE.md
   ```
3. Zona papkasini belgilang: `apps/mobile/`

### Design System qoidalari qo'shish

`.claude/design-system.md` yarating — Figma MCP integration uchun:
```markdown
# Design System
- Theme: [light/dark]
- Colors: semantic tokens
- Components: [UI library] classes
- Icons: Custom SVG
```

### CI/CD template qo'shish

`CLAUDE_DEVOPS.md` yarating:
```markdown
# Docker, CI/CD, Monitoring qoidalari
- Dockerfile multi-stage build
- GitHub Actions pipeline
- Sentry error tracking
- Backup strategy
```

---

## 📊 VENTRA NATIJALARI

Bu tizim VENTRA loyihasida ishlatilgan:
- **26 ta bug** topildi va tuzatildi (1 haftada)
- **4 ta arxitektura** tuzatishi (BigInt global, BillingGuard, Interceptor)
- **2 dasturchi** parallel ishladi (0 merge conflict)
- **43 ta feature** rejalashtirild va tracking qilindi
- **Task tracking** 100% — birorta bug "unutilmadi"

---

*Claude CLI System Template v2.0 | Based on VENTRA Analytics Platform*
