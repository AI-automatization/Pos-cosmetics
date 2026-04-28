# Mobile Session Continuity — Design Spec

**Sana:** 2026-04-28
**Muallif:** Abdulaziz
**Status:** Tasdiqlangan

---

## Muammo

Claude limit tugaganda yoki sessiya to'satdan uzilganda, barcha mobile progress yo'qoladi. Yangi sessiyada user qo'lda "nima qilgandik" deb tushuntirishi kerak.

## Maqsad

- Barcha mobile progress Obsidian da doim saqlansin
- Claude yangi sessiyada avtomatik kontekst olsin
- "davom ettir" desang — Claude qayerda to'xtaganini bilib, davom etsin
- Sessiya yopilmasa ham (limit birdan tugasa) — 15 daqiqa ichida saqlansin

---

## Arxitektura

```
┌─────────────────────────────────────────────────────┐
│  1. Obsidian  →  mobile-progress.md  (to'liq tarix) │
│  2. MEMORY.md →  kompakt xulosa    (avtomatik)       │
│  3a. Stop hook  →  sessiya yopilganda save           │
│  3b. Cron job   →  har 15 daqiqada save              │
│  4. Skill     →  "davom ettir"     (to'liq yuklash)  │
└─────────────────────────────────────────────────────┘
```

### Ma'lumot oqimi

```
Ishlar bajariladi (commits, Done.md yangilanadi)
   ↓
Har 15 daqiqada YOKI Stop hook ishlaydi
   ↓
obsidian-mobile-sync.sh:
  → docs/Done.md  [MOBILE] tasklar → mobile-progress.md
  → docs/Tasks.md [MOBILE] tasklar → keyingi qadamlar
  → git log mobile commitlar       → sessiyalar tarixi
  → MEMORY.md kompakt xulosa yangilanadi
   ↓
Yangi sessiya → MEMORY.md avtomatik o'qiladi
   ↓
"davom ettir" → skill → Obsidian → to'liq kontekst
```

---

## Fayllar

### Yaratiladi

| Fayl | Joyi | Vazifasi |
|------|------|----------|
| `obsidian-mobile-sync.sh` | `~/.claude/scripts/` | Asosiy sync script |
| `com.raos.mobile-sync.plist` | `~/Library/LaunchAgents/` | 15 daqiqada cron |
| `davom-ettir.md` | `~/.claude/skills/` | "davom ettir" skill |
| `mobile-progress.md` | `Obsidian Vault/PROJECTS/RAOS/` | To'liq mobile tarix |

### Kengaytiriladi

| Fayl | O'zgarish |
|------|-----------|
| `obsidian-sync-on-stop.sh` | `obsidian-mobile-sync.sh` ni chaqiradi |
| `obsidian-session-start.sh` | `obsidian-mobile-sync.sh` ni chaqiradi |
| `MEMORY.md` | Mobile compact summary section qo'shiladi |

---

## mobile-progress.md Strukturasi

```markdown
---
project: RAOS Mobile
last_updated: 2026-04-28 14:30
branch: abdulaziz/feat-mobile-ios
---

# Mobile Progress Log

## Hozirgi holat
- **Oxirgi sessiya:** 2026-04-28 14:30
- **Faol branch:** abdulaziz/feat-mobile-ios
- **To'xtatilgan joy:** T-396 bajarildi, keyingi: T-397

## Keyingi qadamlar (ochiq tasklar)
- [ ] T-397 | P1 | [MOBILE] | ...
- [ ] T-398 | P2 | [MOBILE] | ...

## Bajarilgan ishlar
- ✅ T-396 | settings i18n keys | 2026-04-28
- ✅ T-395 | smena screen fix   | 2026-04-27

## Sessiyalar tarixi
### 2026-04-28 14:30
- Commitlar: ec0930c, 3229bd8, 5f55b78
- Bajarildi: T-396, T-395, T-401
```

---

## MEMORY.md Compact Section

```markdown
## Mobile Progress (auto)
- Oxirgi save: 2026-04-28 14:30
- Branch: abdulaziz/feat-mobile-ios
- Oxirgi bajarilgan: T-396, T-395, T-401
- Keyingi: T-397 (P1)
- To'liq tarix: Obsidian → PROJECTS/RAOS/mobile-progress.md
- Davom etish: "davom ettir" de
```

---

## "davom ettir" Skill Xatti-harakati

Trigger so'zlar: `davom ettir`, `continue`, `qayerda to'xtagandik`, `kecha nima qilgandik`

Claude quyidagilarni ko'rsatadi:
1. Qayerda to'xtaganligi (oxirgi task + branch)
2. Oxirgi sessiyada bajarilganlar
3. Keyingi tavsiya (eng yuqori prioritet task, sabab bilan)
4. Navbatdagi tasklar ro'yxati

Keyin darhol ishlashni boshlaydi.

---

## obsidian-mobile-sync.sh Mantigi

1. `docs/Done.md` → `[MOBILE]` tagini filter → `mobile-progress.md` ga qo'shadi (takrorlamas)
2. `docs/Tasks.md` → `[MOBILE]` tagini filter → keyingi qadamlar bo'limini yangilaydi
3. `git log --oneline -20` → mobile-related commitlar → sessiyalar tarixiga
4. `MEMORY.md` → compact section ni `sed` bilan yangilaydi

---

## Cron (launchd plist)

- **Interval:** 900 soniya (15 daqiqa)
- **Script:** `~/.claude/scripts/obsidian-mobile-sync.sh`
- **Log:** `~/.claude/scripts/logs/mobile-sync.log`
- **Start:** `launchctl load` bilan bir marta yoqiladi
