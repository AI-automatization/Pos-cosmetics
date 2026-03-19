# RAOS — Agentlar Qo'llanmasi

> AbdulazizYormatov uchun | Claude Code agentlari bilan ishlash to'liq yo'riqnomasi

---

## 🚀 Agentni qanday ishga tushirish kerak?

### Usul 1: Chat orqali (eng qulay)

VS Code da Claude Code panelini och → chatga yoz:

```
запусти session-start агент
```

yoki o'zbekcha:

```
session-start agentini ishga tushir
```

yoki inglizcha:

```
use the session-start agent
```

Claude o'zi `.claude/agents/session-start.md` ni o'qib, ko'rsatmalarga amal qiladi.

---

### Usul 2: Terminal orqali (VS Code Terminal)

```bash
# Proyekt papkasiga kir
cd /Users/abdulazizyormatov/Documents/tezcode/pos/Pos-cosmetics

# Agentni ishga tushir
claude --agent session-start

# Yoki prompt bilan birga
claude --agent orchestrator "P0 tasklarni ko'rsat"

# Yoki interaktiv rejimda (chat ochiladi)
claude
```

Interaktiv rejimda Claude ochilgach:

```
> use session-start agent
```

---

### Usul 3: Slash command (chat ichida)

Claude Code chat da agentni nomlash kifoya:

```
/session-start
```

```
/orchestrator
```

```
/type-fixer
```

---

## 📋 Barcha agentlar va ularning vazifasi

---

### 🟢 `session-start` — Kunlik ish boshlanishi

**Vazifa:** Har sessiya boshida loyiha holatini tekshiradi. Git status, ochiq P0/P1 tasklar, loglar, merge conflictlar.

**Qachon:** Har kuni VS Code ni ochganda birinchi narsa.

**Qanday chaqirish:**
```
session-start agentini ishga tushir
```

**Nima qiladi:**
- `git status` + so'nggi 5 commit
- Tasks.md dan P0/P1 [FRONTEND] tasklarni chiqaradi
- Merge conflict borligini tekshiradi
- Loglardan xatoliklarni topadi
- Bugungi tavsiya beradi + qaysi agentni ishlatish kerakligini ko'rsatadi

**Misol natija:**
```
## Salom, Abdulaziz! 👋
### 🔴 P0: T-229 (enum mismatch) → type-fixer ishga tushir
### 🟡 P1: T-231 (Owner/Admin separation)
### ⚠️ Merge conflict: CLAUDE.md → conflict-resolver
```

---

### 🤖 `orchestrator` — Bosh koordinator

**Vazifa:** Tasks.md ni o'qib, P0/P1 tasklarni tahlil qilib, to'g'ri agentni tavsiya qiladi yoki ishga tushiradi.

**Qachon:** "Bugun nima qilish kerak?" savoliga javob olish uchun.

**Qanday chaqirish:**
```
orchestrator agentini ishga tushir
```
```
use orchestrator to analyze my tasks
```

**Nima qiladi:**
1. Conflict bormi tekshiradi
2. P0 tasklarni ajratadi + tegishli agentni chaqiradi
3. P1 tasklarni tavsiya qiladi
4. Git da bajarilgan lekin Tasks.md da ochiq turgan tasklarni ko'rsatadi

---

### 🔴 `conflict-resolver` — Merge conflict tuzatish

**Vazifa:** `<<<<<<< ` markerli fayllarni toza qiladi. Stashed versiyani saqlaydi.

**Qachon:** `git status` da conflict ko'ringanda yoki `session-start` conflict topganda.

**Qanday chaqirish:**
```
conflict-resolver agentini ishga tushir
```
```
CLAUDE.md dagi merge conflictni hal qil
```

**Nima qiladi:**
- Barcha conflict markerli fayllarni topadi
- Stashed versiyani oladi (yangi feature lar bor)
- `<<<<<<< `, `=======`, `>>>>>>>>` qatorlarni o'chiradi
- TypeScript xatolik yo'qligini tekshiradi

---

### 🔧 `type-fixer` — T-229 va T-230 (P0 KRITIK)

**Vazifa:** Enum lowercase vs UPPERCASE va payload field nomlari mismatch ni tuzatadi. Hozir bu sabab POS da barcha sotuvlar 400 xato qaytaradi.

**Qachon:** Darhol — bu P0 task (production broken).

**Qanday chaqirish:**
```
type-fixer agentini ishga tushir
```
```
T-229 va T-230 tasklarni hal qil
```

**Nima tuzatadi:**

| Muammo | Eski | Yangi |
|--------|------|-------|
| T-229: PaymentMethod | `'cash'` | `'CASH'` |
| T-229: DiscountType | `'percent'` | `'PERCENT'` |
| T-230: Order payload | `sellPrice` | `unitPrice` |
| T-230: Order payload | `lineDiscount` | `discountAmount` |

**Qaysi fayllarni o'zgartiradi:**
- `apps/web/src/api/orders.api.ts`
- `apps/web/src/hooks/pos/useCompleteSale.ts`
- `apps/web/src/store/pos.store.ts` (agar kerak bo'lsa)

---

### 🔄 `tasks-done-sync` — Tasks.md sinxronizatsiya

**Vazifa:** Git da commit bo'lgan vazifalar Tasks.md da hali "ochiq" ko'rinadi. Ularni Done.md ga ko'chiradi.

**Qachon:** Git log da yangi commitlar bo'lsa va Tasks.md eskirgan ko'rinsa.

**Qanday chaqirish:**
```
tasks-done-sync agentini ishga tushir
```
```
Tasks.md ni Done.md bilan sinxronlashtir
```

**Nima qiladi:**
- Git log dagi commitlarni T-raqamlar bilan moslashtiradi
- Bajarilgan tasklarni Tasks.md dan o'chiradi
- Done.md ga sana + yechim + commit hash bilan qo'shadi

**Masalan:** T-232, T-233, T-234, T-235, T-238 gitda bajarilgan lekin Tasks.md da ochiq — bu agent ularni Done.md ga ko'chiradi.

---

### 🏗️ `component-builder` — UI komponent/sahifa

**Vazifa:** Yangi React komponent yoki Next.js sahifasini yozadi. Tailwind, TypeScript, React Query standartlariga amal qiladi.

**Qachon:** Yangi feature qurishda.

**Qanday chaqirish:**
```
component-builder agentini ishga tushir — P&L hisobot sahifasi kerak
```
```
use component-builder to create P&L report page (T-239)
```

---

### 🔗 `api-integrator` — Backend API ulash

**Vazifa:** Backend endpoint ni frontend ga ulaydi. React Query hook, type, API funksiya.

**Qachon:** Backend tayyor, lekin frontend still mock data ishlatyapti.

**Qanday chaqirish:**
```
api-integrator: T-201 analytics endpoints ni ulab ber
```

---

### 👁️ `frontend-reviewer` — Kod review

**Vazifa:** Yozilgan kodni tekshiradi. SOLID, DRY, TypeScript, 400 qator limit.

**Qachon:** Commit qilishdan oldin.

**Qanday chaqirish:**
```
frontend-reviewer: PaymentPanel.tsx ni review qil
```

---

### 🔍 `type-checker` — TypeScript xatoliklar

**Vazifa:** `tsc --noEmit` ishlatib TypeScript xatoliklarini tuzatadi.

**Qachon:** "Type error" ko'ringanda.

**Qanday chaqirish:**
```
type-checker agentini ishga tushir
```

---

## 📅 Kunlik ish tartibi

```
1. VS Code ochildi
   → "session-start agentini ishga tushir"

2. P0 task ko'rsatdi (masalan T-229/T-230)
   → "type-fixer agentini ishga tushir"

3. Conflict ko'rsatdi
   → "conflict-resolver agentini ishga tushir"

4. Tasks.md eskirgan
   → "tasks-done-sync agentini ishga tushir"

5. Yangi feature boshlash
   → "orchestrator: T-231 ni qanday boshlash kerak?"
   → "component-builder: [vazifa]"

6. Commit qilishdan oldin
   → "frontend-reviewer: [fayl]ni review qil"
```

---

## ⚡ Tez buyruqlar (copy-paste ready)

```
session-start agentini ishga tushir
```

```
orchestrator agentini ishga tushir va P0 tasklarni ko'rsat
```

```
type-fixer agentini ishga tushir — T-229 va T-230 ni tuzat
```

```
conflict-resolver agentini ishga tushir
```

```
tasks-done-sync agentini ishga tushir
```

---

## 🗂️ Agent fayllari joylashuvi

```
.claude/agents/
├── session-start.md      ← Har kuni birinchi
├── orchestrator.md       ← Qaysi task birinchi?
├── conflict-resolver.md  ← Merge conflict
├── type-fixer.md         ← T-229/T-230 P0
├── tasks-done-sync.md    ← Tasks.md tozalash
├── component-builder.md  ← Yangi UI
├── api-integrator.md     ← API ulash
├── frontend-reviewer.md  ← Kod review
└── type-checker.md       ← TypeScript xatolar
```

Yangi agent qo'shish: `.claude/agents/` ga `.md` fayl → Claude uni avtomatik ko'radi.

---

_AGENTS_GUIDE.md | RAOS | 2026-03-18_
