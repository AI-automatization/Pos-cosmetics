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





### ~~UI-051~~ ✅ KirimDetailSheet — `ui-done.md` ga ko'chirildi

---

## PHASE 8 — NASIYA SCREENS

### ~~UI-052~~ ✅ NasiyaListScreen — `ui-done.md` ga ko'chirildi

### ~~UI-053~~ ✅ DebtCard — `ui-done.md` ga ko'chirildi

### ~~UI-054~~ ✅ PayModal — `ui-done.md` ga ko'chirildi

---

## PHASE 9 — SETTINGS & MANAGEMENT SCREENS

### ~~UI-055~~ ✅ MoreMenuScreen — `ui-done.md` ga ko'chirildi

### ~~UI-056~~ ✅ UsersScreen — `ui-done.md` ga ko'chirildi

### ~~UI-057~~ ✅ BranchesScreen — `ui-done.md` ga ko'chirildi

### ~~UI-058~~ ✅ AuditLogScreen — `ui-done.md` ga ko'chirildi

### ~~UI-059~~ ✅ SettingsScreen — `ui-done.md` ga ko'chirildi

---

## PHASE 10 — QOLGAN SCREENLAR

### ~~UI-060~~ ✅ ScannerScreen — `ui-done.md` ga ko'chirildi

### ~~UI-061~~ ✅ AIInsightsScreen — `ui-done.md` ga ko'chirildi

### ~~UI-062~~ ✅ AlertsScreen — `ui-done.md` ga ko'chirildi

### ~~UI-063~~ ✅ RealEstateScreen — `ui-done.md` ga ko'chirildi

### ~~UI-064~~ ✅ RealEstateDetailScreen — `ui-done.md` ga ko'chirildi

### ~~UI-065~~ ✅ PaymentSuccessScreen — `ui-done.md` ga ko'chirildi

### ~~UI-066~~ ✅ PaymentSheet success state — `ui-done.md` ga ko'chirildi

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
| Phase 0 — Foundation | UI-000 → UI-010 (11 ta) | ✅ Done |
| Phase 1 — Auth | UI-011 → UI-013 (3 ta) | ✅ Done |
| Phase 2 — Dashboard | UI-014 → UI-019 (6 ta) | ✅ Done |
| Phase 3 — Savdo/POS | UI-020 → UI-028 (9 ta) | ✅ Done |
| Phase 4 — Sales | UI-029 → UI-032 (4 ta) | ✅ Done |
| Phase 5 — Katalog | UI-033 → UI-036 (4 ta) | ✅ Done |
| Phase 6 — Moliya | UI-037 → UI-045 (9 ta) | ✅ Done |
| Phase 7 — Ombor/Kirim | UI-046 → UI-051 (6 ta) | ✅ Done |
| Phase 8 — Nasiya | UI-052 → UI-054 (3 ta) | ✅ Done |
| Phase 9 — Settings | UI-055 + UI-056 → UI-059 (5 ta) | ✅ Done |
| Phase 10 — Qolgan | UI-060 → UI-066 (7 ta) | ✅ Done |
| **JAMI** | **55 ta task** | **55/55** |

---

## STATUS LEGEND

- ⏳ Pending — hali boshlanmagan
- 🔄 In Progress — bajarilmoqda
- ✅ Done — bajarildi
- 🆕 Yangi screen — mavjud emas, yaratiladi
- ♻️ Redesign — mavjud fayl qayta yoziladi
