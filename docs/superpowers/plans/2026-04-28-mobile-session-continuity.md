# Mobile Session Continuity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** RAOS mobile progress Obsidian da doim saqlanib tursin; Claude yangi sessiyada "davom ettir" desang, qayerda to'xtaganini bilib davom etsin.

**Architecture:** `obsidian-mobile-sync.sh` — asosiy script — `docs/Done.md`, `docs/Tasks.md`, `git log` dan mobile ma'lumotlarni oladi va Obsidian `mobile-progress.md` + `MEMORY.md` ga yozadi. Ikkita trigger: Stop hook (darhol) + launchd cron (har 15 daqiqa, sessiya yopilmasa ham). `davom-ettir` skill yangi sessiyada Obsidian dan to'liq kontekst yuklaydi.

**Tech Stack:** bash, macOS launchd, Obsidian markdown, Claude Code hooks & skills

---

## Fayllar xaritasi

| Fayl | Holati | Vazifasi |
|------|--------|----------|
| `~/.claude/scripts/obsidian-mobile-sync.sh` | YANGI | Asosiy sync script |
| `~/Library/LaunchAgents/com.raos.mobile-sync.plist` | YANGI | 15 daqiqada auto-run |
| `~/.claude/skills/davom-ettir.md` | YANGI | "davom ettir" skill |
| `~/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md` | YANGI | To'liq mobile tarix |
| `/Users/mrz0101aicloud.com/.claude/projects/-Users-mrz0101aicloud-com-Desktop-untitled-folder-5-Pos-cosmetics/memory/MEMORY.md` | YANGI | Compact xulosa (auto-read) |
| `~/.claude/scripts/obsidian-sync-on-stop.sh` | KENGAYTIRILADI | Mobile sync chaqiradi |
| `~/.claude/scripts/obsidian-session-start.sh` | KENGAYTIRILADI | Mobile sync chaqiradi |

---

## Chunk 1: Obsidian fayl + asosiy sync script

### Task 1: mobile-progress.md yaratish

**Files:**
- Create: `~/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md`

- [ ] **Step 1: Fayl yaratish**

```bash
cat > "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md" << 'EOF'
---
project: RAOS Mobile
last_updated: placeholder
branch: placeholder
---

# Mobile Progress Log

## Hozirgi holat
- **Oxirgi save:** —
- **Faol branch:** —
- **To'xtatilgan joy:** —

## Keyingi qadamlar (ochiq [MOBILE] tasklar)
_Sync kutilmoqda..._

## Bajarilgan ishlar ([MOBILE] Done.md dan)
_Sync kutilmoqda..._

## Sessiyalar tarixi
_Sync kutilmoqda..._
EOF
```

- [ ] **Step 2: Fayl yaratilganini tekshirish**

```bash
ls -la "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md"
```

Kutilgan: fayl ko'rinadi, 0 dan katta hajm.

---

### Task 2: obsidian-mobile-sync.sh yaratish

**Files:**
- Create: `~/.claude/scripts/obsidian-mobile-sync.sh`

- [ ] **Step 1: Script yozish**

```bash
cat > ~/.claude/scripts/obsidian-mobile-sync.sh << 'SCRIPT'
#!/bin/bash
# RAOS Mobile Session Continuity — asosiy sync script
# Manba: docs/Done.md, docs/Tasks.md, git log
# Maqsad: Obsidian mobile-progress.md + MEMORY.md

REPO="/Users/mrz0101aicloud.com/Desktop/untitled folder 5/Pos-cosmetics"
VAULT="/Users/mrz0101aicloud.com/Documents/Obsidian Vault"
MOBILE_PROGRESS="$VAULT/PROJECTS/RAOS/mobile-progress.md"
MEMORY_DIR="/Users/mrz0101aicloud.com/.claude/projects/-Users-mrz0101aicloud-com-Desktop-untitled-folder-5-Pos-cosmetics/memory"
MEMORY_FILE="$MEMORY_DIR/MEMORY.md"
LOG_FILE="$HOME/.claude/scripts/logs/mobile-sync.log"
NOW=$(date +"%Y-%m-%d %H:%M")
NOW_DATE=$(date +"%Y-%m-%d")

mkdir -p "$(dirname "$LOG_FILE")" "$MEMORY_DIR"
log() { echo "[$NOW] $1" >> "$LOG_FILE"; }

# Log rotation
if [ -f "$LOG_FILE" ] && [ "$(wc -l < "$LOG_FILE")" -gt 300 ]; then
  tail -200 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

log "--- Mobile sync started ---"

# --- 1. Git ma'lumotlari ---
cd "$REPO" 2>/dev/null || { log "ERROR: repo not found"; exit 1; }
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
RECENT_COMMITS=$(git log --oneline -10 --grep="\[mobile\]\|mobile\|Mobile\|ios\|iOS\|android\|Android" 2>/dev/null | head -10)
if [ -z "$RECENT_COMMITS" ]; then
  RECENT_COMMITS=$(git log --oneline -5 2>/dev/null)
fi

# --- 2. Done.md dan [MOBILE] tasklar ---
DONE_FILE="$REPO/docs/Done.md"
DONE_MOBILE=""
if [ -f "$DONE_FILE" ]; then
  # T-XXX | DONE | [MOBILE] formatdagi bloklar
  DONE_MOBILE=$(grep -A3 "\[MOBILE\]" "$DONE_FILE" 2>/dev/null | grep -E "^## T-|Bajarildi:|Yechim:" | head -30)
  # Compact: faqat T-nomer, sana, sarlavha
  DONE_COMPACT=$(grep "^## T-" "$DONE_FILE" 2>/dev/null | grep "\[MOBILE\]" | sed 's/## /- ✅ /' | tail -15)
fi
[ -z "$DONE_COMPACT" ] && DONE_COMPACT="- Hali bajarilgan ishlar yo'q"

# --- 3. Tasks.md dan ochiq [MOBILE] tasklar ---
TASKS_FILE="$REPO/docs/Tasks.md"
OPEN_TASKS=""
NEXT_TASK=""
if [ -f "$TASKS_FILE" ]; then
  OPEN_TASKS=$(grep "^## T-" "$TASKS_FILE" 2>/dev/null | grep "\[MOBILE\]" | sed 's/## /- [ ] /' | head -10)
  NEXT_TASK=$(grep "^## T-" "$TASKS_FILE" 2>/dev/null | grep "\[MOBILE\]" | head -1 | sed 's/## //')
fi
[ -z "$OPEN_TASKS" ] && OPEN_TASKS="- Barcha mobile tasklar bajarilgan!"
[ -z "$NEXT_TASK" ] && NEXT_TASK="Yangi task yo'q"

# --- 4. mobile-progress.md yangilash ---
cat > "$MOBILE_PROGRESS" << MDEOF
---
project: RAOS Mobile
last_updated: $NOW
branch: $BRANCH
---

# Mobile Progress Log

## Hozirgi holat
- **Oxirgi save:** $NOW
- **Faol branch:** \`$BRANCH\`
- **Uncommitted fayllar:** $UNCOMMITTED
- **Keyingi task:** $NEXT_TASK

## Keyingi qadamlar (ochiq [MOBILE] tasklar)
$OPEN_TASKS

## Bajarilgan ishlar ([MOBILE] Done.md dan)
$DONE_COMPACT

## Oxirgi commitlar
$(echo "$RECENT_COMMITS" | sed 's/^/- /')

## Sessiyalar tarixi
### $NOW
- Branch: \`$BRANCH\`
- Uncommitted: $UNCOMMITTED fayl
- Sync: avtomatik

MDEOF

log "mobile-progress.md yangilandi (branch: $BRANCH, next: $NEXT_TASK)"

# --- 5. MEMORY.md compact section yangilash ---
MEMORY_SECTION="## Mobile Progress (auto)
- Oxirgi save: $NOW
- Branch: \`$BRANCH\`
- Keyingi task: $NEXT_TASK
- Uncommitted: $UNCOMMITTED fayl
- To'liq tarix: Obsidian → PROJECTS/RAOS/mobile-progress.md
- Davom etish uchun: **\"davom ettir\"** de"

if [ -f "$MEMORY_FILE" ]; then
  # Mavjud Mobile Progress section ni yangilash
  if grep -q "^## Mobile Progress" "$MEMORY_FILE"; then
    # Section ni o'chirib qayta yozish
    python3 - "$MEMORY_FILE" "$MEMORY_SECTION" << 'PYEOF'
import sys, re
path = sys.argv[1]
new_section = sys.argv[2]
with open(path, 'r') as f:
    content = f.read()
# ## Mobile Progress ... keyingi ## gacha o'chirish
content = re.sub(r'## Mobile Progress \(auto\).*?(?=\n## |\Z)', '', content, flags=re.DOTALL)
content = content.rstrip('\n') + '\n\n' + new_section + '\n'
with open(path, 'w') as f:
    f.write(content)
PYEOF
  else
    echo "" >> "$MEMORY_FILE"
    echo "$MEMORY_SECTION" >> "$MEMORY_FILE"
  fi
else
  # MEMORY.md yo'q — yangi yaratish
  cat > "$MEMORY_FILE" << MEMEOF
# RAOS Mobile — Project Memory

Ushbu fayl Claude Code tomonidan avtomatik yangilanadi.

$MEMORY_SECTION
MEMEOF
fi

log "MEMORY.md yangilandi"
log "--- Mobile sync finished ---"
SCRIPT
```

- [ ] **Step 2: Executable qilish**

```bash
chmod +x ~/.claude/scripts/obsidian-mobile-sync.sh
```

- [ ] **Step 3: Birinchi marta ishlatib tekshirish**

```bash
bash ~/.claude/scripts/obsidian-mobile-sync.sh
```

Kutilgan: xato yo'q, `mobile-progress.md` yangilangan, log yozilgan.

- [ ] **Step 4: Natijalarni tekshirish**

```bash
cat "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md"
echo "---"
cat "/Users/mrz0101aicloud.com/.claude/projects/-Users-mrz0101aicloud-com-Desktop-untitled-folder-5-Pos-cosmetics/memory/MEMORY.md"
echo "---"
cat ~/.claude/scripts/logs/mobile-sync.log | tail -10
```

Kutilgan: `mobile-progress.md` da branch, tasklar, done ishlar ko'rinadi. MEMORY.md da compact section bor.

---

## Chunk 2: Cron (launchd) + Hook kengaytirish

### Task 3: launchd plist yaratish (15 daqiqada auto-save)

**Files:**
- Create: `~/Library/LaunchAgents/com.raos.mobile-sync.plist`

- [ ] **Step 1: Plist yaratish**

```bash
cat > ~/Library/LaunchAgents/com.raos.mobile-sync.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.raos.mobile-sync</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/mrz0101aicloud.com/.claude/scripts/obsidian-mobile-sync.sh</string>
  </array>

  <key>StartInterval</key>
  <integer>900</integer>

  <key>RunAtLoad</key>
  <false/>

  <key>StandardOutPath</key>
  <string>/Users/mrz0101aicloud.com/.claude/scripts/logs/mobile-sync-launchd.log</string>

  <key>StandardErrorPath</key>
  <string>/Users/mrz0101aicloud.com/.claude/scripts/logs/mobile-sync-launchd.log</string>
</dict>
</plist>
EOF
```

- [ ] **Step 2: launchd ga yuklash**

```bash
launchctl load ~/Library/LaunchAgents/com.raos.mobile-sync.plist
```

- [ ] **Step 3: Yuklanganligi tekshirish**

```bash
launchctl list | grep raos
```

Kutilgan: `com.raos.mobile-sync` ko'rinadi.

---

### Task 4: obsidian-sync-on-stop.sh kengaytirish

**Files:**
- Modify: `~/.claude/scripts/obsidian-sync-on-stop.sh`

- [ ] **Step 1: Faylni o'qish**

```bash
cat ~/.claude/scripts/obsidian-sync-on-stop.sh
```

- [ ] **Step 2: Oxiriga mobile sync qo'shish**

Faylning eng oxirgi qatoridan keyin quyidagini qo'shish (`exit 0` dan OLDIN yoki faylning oxiriga):

```bash
# Quyidagi qatorni obsidian-sync-on-stop.sh oxiriga qo'shish:
# Mobile sync — har Stop da ishlaydi
bash "$HOME/.claude/scripts/obsidian-mobile-sync.sh" &
```

Bash buyrug'i:
```bash
# Fayl oxiridan oldingi bo'sh qatorga qo'shish
echo "" >> ~/.claude/scripts/obsidian-sync-on-stop.sh
echo "# Mobile session continuity sync" >> ~/.claude/scripts/obsidian-sync-on-stop.sh
echo 'bash "$HOME/.claude/scripts/obsidian-mobile-sync.sh" &' >> ~/.claude/scripts/obsidian-sync-on-stop.sh
```

- [ ] **Step 3: Qo'shilganini tekshirish**

```bash
tail -5 ~/.claude/scripts/obsidian-sync-on-stop.sh
```

Kutilgan: mobile sync qatori ko'rinadi.

---

### Task 5: obsidian-session-start.sh kengaytirish

**Files:**
- Modify: `~/.claude/scripts/obsidian-session-start.sh`

- [ ] **Step 1: Faylni o'qish**

```bash
cat ~/.claude/scripts/obsidian-session-start.sh
```

- [ ] **Step 2: Sessiya boshida ham sync**

```bash
echo "" >> ~/.claude/scripts/obsidian-session-start.sh
echo "# Mobile sync on session start" >> ~/.claude/scripts/obsidian-session-start.sh
echo 'bash "$HOME/.claude/scripts/obsidian-mobile-sync.sh" &' >> ~/.claude/scripts/obsidian-session-start.sh
```

- [ ] **Step 3: Tekshirish**

```bash
tail -5 ~/.claude/scripts/obsidian-session-start.sh
```

---

## Chunk 3: "davom ettir" skill + MEMORY.md

### Task 6: davom-ettir skill yaratish

**Files:**
- Create: `~/.claude/skills/davom-ettir.md`

- [ ] **Step 1: Skill yozish**

```bash
cat > ~/.claude/skills/davom-ettir.md << 'EOF'
---
name: davom-ettir
description: >
  RAOS Mobile sessiya davom ettirish. Trigger so'zlar:
  "davom ettir", "continue", "qayerda to'xtagandik",
  "kecha nima qilgandik", "ishni davom ettir".
  Obsidian dan mobile progress o'qib, qayerda to'xtaganini
  ko'rsatadi va keyingi taskni tavsiya qiladi.
---

# davom-ettir skill

Foydalanuvchi "davom ettir" (yoki shunga o'xshash) deganda:

## 1. Obsidian dan o'qi

Quyidagi faylni o'qi:
`/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md`

## 2. Quyidagi formatda ko'rsat

```
📍 Qayerda to'xtagandik:
   [Hozirgi holat bo'limidan: branch, oxirgi save, keyingi task]

✅ Oxirgi bajarilgan ishlar:
   [Bajarilgan ishlar bo'limidan: so'nggi 5 ta]

🎯 Keyingi tavsiya:
   → [Eng yuqori prioritetli ochiq task]
   Sabab: [nima uchun bu birinchi]

📋 Barcha ochiq tasklar:
   [Keyingi qadamlar bo'limidan]
```

## 3. Darhol ishlashni boshlat

Tavsiya qilingan taskni boshlab, ishlashni davom ettir.
Foydalanuvchidan qo'shimcha tushuntirish so'raMa.
EOF
```

- [ ] **Step 2: Skill mavjudligini tekshirish**

```bash
ls -la ~/.claude/skills/davom-ettir.md
```

---

### Task 7: Yakuniy tekshiruv — to'liq oqim sinovdan o'tkazish

- [ ] **Step 1: Sync qo'lda ishlatish**

```bash
bash ~/.claude/scripts/obsidian-mobile-sync.sh
```

- [ ] **Step 2: Obsidian fayl to'g'ri to'lganligini tekshirish**

```bash
cat "/Users/mrz0101aicloud.com/Documents/Obsidian Vault/PROJECTS/RAOS/mobile-progress.md"
```

Kutilgan:
- `last_updated` bugungi sana
- `branch` haqiqiy branch nomi
- `Keyingi qadamlar` da [MOBILE] tasklar bor
- `Bajarilgan ishlar` da Done.md dagi [MOBILE] tasklar bor

- [ ] **Step 3: MEMORY.md to'g'ri to'lganligini tekshirish**

```bash
cat "/Users/mrz0101aicloud.com/.claude/projects/-Users-mrz0101aicloud-com-Desktop-untitled-folder-5-Pos-cosmetics/memory/MEMORY.md"
```

Kutilgan: `## Mobile Progress (auto)` section bor, branch va next task ko'rinadi.

- [ ] **Step 4: launchd ishlayotganligini tekshirish**

```bash
launchctl list | grep raos
```

Kutilgan: `com.raos.mobile-sync` ro'yxatda bor.

- [ ] **Step 5: Log faylni tekshirish**

```bash
cat ~/.claude/scripts/logs/mobile-sync.log | tail -15
```

Kutilgan: Sync started/finished log yozuvlari ko'rinadi.

---

## Qo'shimcha: Unload/reload buyruqlari (zarur bo'lsa)

```bash
# Cron ni to'xtatish:
launchctl unload ~/Library/LaunchAgents/com.raos.mobile-sync.plist

# Qayta yuklash:
launchctl load ~/Library/LaunchAgents/com.raos.mobile-sync.plist

# Qo'lda sinash:
bash ~/.claude/scripts/obsidian-mobile-sync.sh
```
