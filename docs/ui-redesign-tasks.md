# RAOS Mobile — Stitch AI UI Redesign Tasks

> **Dizayn manba:** `docs/stitch-ai-mobile-prompt.md`
> **Stitch loyiha:** https://stitch.withgoogle.com/projects/5941226341806927081
> **Jami:** 33 screen | **Yangi:** 15 ta | **Redesign:** 18 ta
> **Sana:** 2026-04-14

---

## DIZAYN TIZIMI (Design Tokens)

```
Primary:       #2563EB  (blue-600)
PrimaryDark:   #1D4ED8  (blue-700)
PrimaryLight:  #EFF6FF  (blue-50)
Success:       #16A34A
Warning:       #D97706
Danger:        #DC2626
Background:    #F9FAFB
Surface:       #FFFFFF
Border:        #E5E7EB
Text:          #111827
TextSecondary: #6B7280

Font: Inter (yoki system default)
BorderRadius: sm=6, md=10, lg=14, xl=18
Spacing: 4, 8, 12, 16, 20, 24, 32px
```

---

## PHASE 1 — AUTH SCREENS

---

## PHASE 2 — DASHBOARD SCREEN







---

## PHASE 3 — SAVDO (POS) SCREENS










---

## PHASE 4 — SALES HISTORY SCREENS





---

## PHASE 5 — KATALOG SCREENS (🆕 Barcha yangi)





---

## PHASE 6 — MOLIYA SCREENS (🆕 Barcha yangi)










---

## PHASE 7 — OMBOR & KIRIM SCREENS





### UI-051 | KIRIM — KirimDetailSheet
- **Fayl:** `apps/mobile/src/screens/Kirim/KirimDetailSheet.tsx`
- **Status:** ♻️ Redesign
- **O'zgarishlar:** Info section + items list + "Qabul qilish" (green) + "Bekor qilish" (red) buttons

---

## PHASE 8 — NASIYA SCREENS

### UI-052 | NASIYA — NasiyaListScreen
- **Fayl:** `apps/mobile/src/screens/Nasiya/index.tsx` ← (mavjud bo'lmasa yangi)
- **Status:** ♻️ Redesign
- **Stitch screen:** `4a16bb38ca3f47a1942f008acb99def8` — "Qarz to'lash"
- **O'zgarishlar:**
  - Header: "Nasiya"
  - Search: "Xaridor ismi..."
  - Debt cards: customer name + phone + due date + qolgan qarz + debt age badge
  - QuickPaySheet bilan "To'lash" button

### UI-053 | NASIYA — DebtCard
- **Fayl:** `apps/mobile/src/screens/Nasiya/DebtCard.tsx`
- **Status:** ♻️ Redesign
- **O'zgarishlar:** White card, debt age color-coded badge, "To'lash" button (blue pill)

### UI-054 | NASIYA — PayModal (QuickPay)
- **Fayl:** `apps/mobile/src/screens/Nasiya/PayModal.tsx`
- **Status:** ♻️ Redesign
- **O'zgarishlar:**
  - Orange info box: "Qolgan qarz: X so'm"
  - Amount input + "50%" / "To'liq" quick buttons
  - Payment method radio: Naqd / Karta / O'tkazma

---

## PHASE 9 — SETTINGS & MANAGEMENT SCREENS

### UI-055 | MORE — MoreMenuScreen
- **Fayl:** `apps/mobile/src/screens/MoreMenu/index.tsx` ← **YANGI FAYL**
- **Status:** 🆕 Yangi screen (TabNavigator Tab 5)
- **Stitch screen:** `3d5166ad43bf47758dbc54e82b13fe5a` — "Ko'proq (Menu)"
- **Tuzilish:**
  - Header: "Ko'proq"
  - User profile card: avatar (48x48 blue circle, initials) + name + role badge + branch
  - Menu groups: Inventar / Biznes / Boshqaruv (MANAGER+ only) / Sozlamalar
  - Each item: icon in gray-100 circle (36x36) + title + subtitle + ChevronRight
  - "Chiqish" item: red text, LogOut icon

### UI-056 | USERS — UsersScreen ← 🆕 YANGI SCREEN
- **Fayl:** `apps/mobile/src/screens/Settings/UsersScreen.tsx` ← **YANGI FAYL**
- **Status:** 🆕 Yangi screen
- **Stitch screen:** `7db7db294bd94e9e8b193a915bc3ae82` — "Foydalanuvchilar"
- **Tuzilish:**
  - Header: "Foydalanuvchilar" + Plus icon
  - Stats: Jami / Faol / Nofaol
  - Search: "Ism yoki telefon..."
  - User cards: avatar (role-color bg, initials) + name + phone + role badge + status dot + "So'nggi kirish"
  - Role badges: EGASI(purple) / ADMIN(red) / MENEDZHER(blue) / KASSIR(green) / KO'RUVCHI(gray)
  - Swipe: Faollashtirish/Bloklash + Tahrirlash
  - UserFormSheet: ism, telefon, parol, rol

### UI-057 | BRANCHES — BranchesScreen ← 🆕 YANGI SCREEN
- **Fayl:** `apps/mobile/src/screens/Settings/BranchesScreen.tsx` ← **YANGI FAYL**
- **Status:** 🆕 Yangi screen
- **Tuzilish:**
  - Header: "Filiallar" + Plus icon
  - Branch cards: Building icon (blue-50 circle) + name + address + status toggle
  - Swipe: Tahrirlash + O'chirish
  - BranchFormSheet: nomi, manzil

### UI-058 | AUDIT — AuditLogScreen ← 🆕 YANGI SCREEN
- **Fayl:** `apps/mobile/src/screens/Settings/AuditLogScreen.tsx` ← **YANGI FAYL**
- **Status:** 🆕 Yangi screen
- **Tuzilish:**
  - Header: "Audit jurnali"
  - Search + action filter dropdown
  - Log items: action badge (CREATE=green/UPDATE=blue/DELETE=red/LOGIN=gray) + date + user + entity
  - Expandable detail: old/new JSON preview (red-50 / green-50 bg)

### UI-059 | SETTINGS — SettingsScreen
- **Fayl:** `apps/mobile/src/screens/Settings/index.tsx`
- **Status:** ♻️ Redesign
- **Tuzilish:**
  - Profile card: avatar + name + role + branch + "Profilni tahrirlash"
  - Sections: Hisob / Ilova / Xavfsizlik / Ma'lumot
  - Each setting row: icon + title + subtitle + chevron / toggle
  - Language toggle: O'zbek / Русский
  - Theme: Yorug' / Qorong'u / Tizim
  - Biometric toggle + auto-lock timer

---

## PHASE 10 — QOLGAN SCREENLAR

### UI-060 | SCANNER — ScannerScreen (Barcode scanner)
- **Fayl:** `apps/mobile/src/screens/Scanner/index.tsx`
- **Status:** ♻️ Redesign
- **Stitch screen:** `85b8fb50ecae4cb098744e58819eb14e` — "Zaxira skaneri"
- **O'zgarishlar:**
  - Camera preview 60% screen + scanning frame animation
  - Manual barcode input below
  - Scan result card: image + name + SKU + current stock (large colored)
  - "Sana sanash" button → CountQtyModal
  - Count history list below

### UI-061 | AI — AIInsightsScreen
- **Fayl:** `apps/mobile/src/screens/AIInsights/index.tsx`
- **Status:** ♻️ Redesign
- **O'zgarishlar:**
  - Header: "AI tahlil" + sparkle icon
  - Period selector
  - TrendCard list: type badge + title + description + sparkline + ChevronRight
  - Categories: Dead stock (red) / Rising (green) / Margin warnings (orange) / Seasonal (blue)

### UI-062 | ALERTS — AlertsScreen
- **Fayl:** `apps/mobile/src/screens/Alerts/index.tsx`
- **Status:** ♻️ Redesign
- **O'zgarishlar:**
  - Header: "Bildirishnomalar" + "Hammasini o'qish" right
  - Filter pills: Barchasi / O'qilmagan / Muhim
  - Alert items: colored icon circle + title + description + time ago + unread dot (blue)
  - Unread: left blue border 4px

### UI-063 | REALESTATE — RealEstateScreen
- **Fayl:** `apps/mobile/src/screens/RealEstate/index.tsx`
- **Status:** ♻️ Redesign
- **Stitch screen:** `1e70c643c9434aa8abfdffe27de804fb` — "Ko'chmas mulk"
- **O'zgarishlar:**
  - Header: "Ko'chmas mulk" + Plus icon
  - Summary cards 2x2: Jami / Band (green) / Bo'sh (gray) / Muddati o'tgan (red)
  - Property cards: photo (16:9, gradient overlay) + address + tenant + rent + status badge

### UI-064 | REALESTATE — RealEstateDetailScreen
- **Fayl:** `apps/mobile/src/screens/RealEstate/PropertyDetail.tsx`
- **Status:** ♻️ Redesign
- **O'zgarishlar:** Full property info + tenant + payment history + monthly chart

### UI-065 | SAVDO — PaymentSuccessScreen (To'lov muvaffaqiyatli)
- **Fayl:** `apps/mobile/src/screens/Savdo/PaymentSuccessScreen.tsx` ← **YANGI FAYL**
- **Status:** 🆕 Yangi screen
- **Stitch screen:** `86d34f592f764319bd45e3e2ef3ce6f1` — "To'lov muvaffaqiyatli"
- **Tuzilish:**
  - Full screen, white bg, centered
  - Large green checkmark animation (top 40%)
  - "To'lov muvaffaqiyatli amalga oshirildi!" (20px bold, green)
  - Order number: "#ORD-XXXX" (blue, monospace)
  - Items summary: product rows with qty + price
  - Subtotal + tax + **Jami** (bold, large)
  - Payment method badge (Uzcard/Naqd/Karta)
  - "Yangi savdo" button (blue, full width)
  - "Chek chop etish" link (gray text)
  - Auto-dismiss after 3s or manual close

### UI-066 | MOLIYA — PaymentSuccessReceipt (To'lov muvaffaqiyatli detail)
- **Fayl:** UI-025 PaymentSheet ichiga integratsiya (PostSuccess view)
- **Status:** ♻️ UI-025 ga qo'shimcha
- **O'zgarishlar:** PaymentSheet confirmed → success state ko'rsatish → auto-dismiss 3s

---

## PARALLEL IMPLEMENTATION GROUPS

Barcha foundation (UI-000 → UI-010) tugagandan keyin parallel ishlatish:

| Group | Agent | Tasklar | Screen soni |
|-------|-------|---------|-------------|
| **A** | Agent-Auth | UI-011, 012, 013 | 3 |
| **B** | Agent-Dashboard | UI-014 → 019 | 6 |
| **C** | Agent-Savdo | UI-020 → 028 | 9 |
| **D** | Agent-Sales | UI-029 → 032 | 4 |
| **E** | Agent-Katalog | UI-033 → 036 | 4 |
| **F** | Agent-Moliya | UI-037 → 045 | 9 |
| **G** | Agent-Ombor | UI-046 → 054 | 9 |
| **H** | Agent-Settings | UI-055 → 059 | 5 |
| **I** | Agent-Other | UI-060 → 064 | 5 |
| **J** | Agent-Savdo+ | UI-065, 066 | 2 |

---

## PROGRESS TRACKER

| Phase | Tasklar | Status |
|-------|---------|--------|
| Phase 0 — Foundation | UI-000 → UI-010 (11 ta) | ⏳ Pending |
| Phase 1 — Auth | UI-011 → UI-013 (3 ta) | ⏳ Pending |
| Phase 2 — Dashboard | UI-014 → UI-019 (6 ta) | ⏳ Pending |
| Phase 3 — Savdo/POS | UI-020 → UI-028 (9 ta) | ⏳ Pending |
| Phase 4 — Sales | UI-029 → UI-032 (4 ta) | ⏳ Pending |
| Phase 5 — Katalog | UI-033 → UI-036 (4 ta) | ⏳ Pending |
| Phase 6 — Moliya | UI-037 → UI-045 (9 ta) | ⏳ Pending |
| Phase 7 — Ombor/Kirim | UI-046 → UI-054 (9 ta) | ⏳ Pending |
| Phase 8 — Nasiya | UI-052 → UI-054 (3 ta) | ⏳ Pending |
| Phase 9 — Settings | UI-055 → UI-059 (5 ta) | ⏳ Pending |
| Phase 10 — Qolgan | UI-060 → UI-064 (5 ta) | ⏳ Pending |
| **JAMI** | **66 ta task** | **0/66** |

---

## STATUS LEGEND

- ⏳ Pending — hali boshlanmagan
- 🔄 In Progress — bajarilmoqda
- ✅ Done — bajarildi
- 🆕 Yangi screen — mavjud emas, yaratiladi
- ♻️ Redesign — mavjud fayl qayta yoziladi
