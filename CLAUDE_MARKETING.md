# CLAUDE_MARKETING.md — RAOS Marketing Department

_Mas'ul: Shuhratov (Marketing) + Ibrat (ishtirokchi) | Zona: docs/marketing/, docs/outreach/_
_Versiya: 2.0 | 2026-06-02_

---

## 👤 Kim uchun bu fayl

**Shuhratov** — RAOS Marketing Manager (asosiy).
- Instagram, Reels, Stories, Ads, Lead Gen
- Kod yozmaydi — faqat `docs/marketing/` va `docs/outreach/` bilan ishlaydi
- Agentlar va skilllar orqali ish qiladi

**Ibrat** — Marketing ishtirokchi (texnik qo'llab-quvvatlash).
- AI Council tizimini boshqaradi (tezcode-bot orqali)
- 30 kunlik reja yaratadi va cron triggerlarni sozlaydi
- docs/marketing/ da kontent yozishi mumkin
- docs/outreach/ — faqat Shuhratov

---

## 🎯 RAOS Marketing Maqsadi

**Mahsulot:** B2B SaaS POS tizim (do'kon egalariga)
**Bozor:** O'zbekiston — Toshkent va viloyatlar
**Til:** O'zbek (asosiy) + Rus (Toshkent)
**ЦА:** 1–10 filiali bo'lgan do'kon egalari, tadbirkorlar

### Konversiya voronkasi
```
Instagram Reel/Post
    ↓
Bio link → raos.uz landing
    ↓
Demo so'rovi / Ro'yxatdan o'tish
    ↓
Free trial → Sotilgan litsenziya
```

---

## 🤖 AGENTLAR (Claude CLI orqali chaqirish)

### Qachon qaysi agent?

| Vazifa | Agent | Chaqirish |
|--------|-------|-----------|
| Instagram strategiya + kontent reja | `marketing-strategist` | "marketing-strategist agentini ishga tushir" |
| Reels scenariy + render | `reels-creator` | "reels-creator agentini ishga tushir" |
| Meta Ads kampaniya boshqarish | `ads-manager` | "ads-manager agentini ishga tushir" |
| Lead generation + DM | `lead-gen` | "lead-gen agentini ishga tushir" |
| Raqobat tahlili | `competitor-analyst` | "competitor-analyst agentini ishga tushir" |

---

## 🛠️ SKILLLAR (Claude skill tizimi)

### Asosiy skilllar

```
/instagram-marketing    → Reels, Stories, bio, content calendar, hashtag
/ads                    → Meta Ads strategiya, budget, A/B test, targeting
/ad-copy               → Kreativ matnlar — O'zbek + Rus tilida
/digital-marketing     → Growth marketing tizimi, short-form video
/social-media-suite    → Avtomatik posting (Instagram + YouTube)
```

### Qo'shimcha skilllar

```
/content-marketing     → Editorial calendar, funnel kontenti
/copywriting           → Landing page, email, CTA matnlar
/conversion-optimization → Voronka optimizatsiyasi, A/B test
/brand                 → Brand guidelines, identichnost
/growth-hacking        → B2B SaaS viral mexanikalar
/lead-generation       → Live Twitter/Instagram/Reddit leads
/lead-radar            → Har kuni potentsial xaridorlarni topadi
/abm-outbound          → LinkedIn URL → outbound kampaniya
```

### Qanday ishlatish

```bash
# Masalan, Instagram kontent reja kerak bo'lsa:
/instagram-marketing

# Meta Ads kampaniya kerak bo'lsa:
/ads

# Reklama matn kerak bo'lsa:
/ad-copy
```

---

## 📱 INSTAGRAM CONTENT STRATEGY

### Content Pillars (5 ta)

| Pillar | % | Format | Namuna mavzu |
|--------|---|--------|-------------|
| **Education** | 30% | Carousel, Reel | "Kassirlar nega hisobot beradi?" |
| **Social Proof** | 25% | Carousel, Story | "+40% daromad — Aziza do'koni" |
| **Product Demo** | 20% | Reel | "30 sekund ichida tovar kiritish" |
| **Behind the scenes** | 15% | Story, Reel | "RAOS qanday ishlaydi" |
| **Engagement** | 10% | Story poll, Q&A | "Do'koningizda nechta kassa?" |

### Haftalik posting jadval

```
Dushanba:   Reel (product demo) — 18:00–19:00
Chorshanba: Carousel (education) — 12:00–13:00
Juma:       Story poll + Reel (social proof) — 17:00–18:00
Shanba:     Behind the scenes — 11:00–12:00
```

### Reels formula (60 sek)

```
0–3s   → HOOK: "Do'koningiz pul yo'qotayaptimi?" (O'zbek)
3–15s  → PAIN: 3 ta muammo (kassa/inventar/hisobot)
15–40s → SOLUTION: RAOS demo (screen recording)
40–55s → PROOF: raqamlar + testimonial
55–60s → CTA: "Link bio'da — bepul sinab ko'ring"
```

---

## 💰 META ADS (Таргетлаш)

### Asosiy auditoriya

```
Geo:       Toshkent city → keyin viloyatlar
Til:       O'zbek + Rus
Yosh:      25–45
Qiziqish:  Business management, Retail, E-commerce
Xulq:      Small business owners, engaged shoppers
```

### Faza 1 — Manual (hozir)

```
Meta Ads Manager → qo'lda sozlash
Kampaniya tuzilishi:
  Campaign (Awareness/Leads)
    └── Ad Set (Toshkent, 25–45, Business owner)
         └── Ad Creative (Reel + Caption)

Budget: $5–10/kun test → $20–50/kun scale
```

### Faza 2 — Semi-auto (1–2 oy)

```
/ads skill → strategiya
/ad-copy skill → A/B test kreativlar
Playwright → monitoring va reporting
```

### Faza 3 — Computer MCP (3+ oy)

```
Computer MCP → Meta Ads Manager brauzerda to'liq boshqarish
  - Kampaniya yaratish
  - Kreativ almashtirish
  - Budget optimallashtirish
  - Raqobat monitoring
```

### Targetlash nюanslar (MUHIM)

```
⚠️  Meta Ads "Small Business" interesti Uzbekistanda keng — lookalike ishlatish
⚠️  O'zbek tilida reklama CTR ko'proq (lotin alifbosi)
⚠️  Video ads CPC < Image ads — Reels prioritet
⚠️  Retargeting: raos.uz visitors (pixel) — eng yuqori konversiya
⚠️  Dayparting: 18:00–22:00 UZT eng aktiv vaqt
```

---

## 📊 KPI VA METRICS

### Oylik maqsadlar

| Metrik | Hozir | 3 oy | 6 oy |
|--------|-------|------|------|
| Instagram followers | — | 1K | 5K |
| Monthly reach | — | 50K | 200K |
| Reel views | — | 5K/post | 25K/post |
| Bio link clicks | — | 200/oy | 1000/oy |
| Demo so'rovlari | — | 10/oy | 50/oy |
| CAC ($/lead) | — | <$20 | <$10 |

### Haftalik reporting format

```markdown
## Hafta [N] Hisobot — [sana]

### Instagram
- Follower o'sish: +[N]
- Eng yaxshi post: [link] — [N] views
- Reach: [N]

### Meta Ads
- Spend: $[N]
- Leads: [N]
- CPC: $[N]
- CPL: $[N]

### Lead Gen
- DM yuborildi: [N]
- Javob olindi: [N]
- Demo rejalashtirildi: [N]

### Keyingi hafta rejasi
- [ ] [vazifa 1]
- [ ] [vazifa 2]
```

---

## 📁 FAYL TUZILISHI

```
docs/
  marketing/
    README.md                    ← Bu fayl bilan parallel
    strategy/
      brand-guidelines.md        ← Brand voice, rang, shrift
      content-pillars.md         ← 5 pillar strategiya
      competitor-analysis.md     ← Raqobatchilar
    campaigns/
      YYYY-MM-[kampaniya-nomi].md ← Har kampaniya alohida fayl
    ads/
      meta-ads-audiences.md      ← Saqlangan auditoriyalar
      creatives/                 ← Ad creative brief'lar
    reports/
      YYYY-MM-weekly.md          ← Haftalik hisobotlar
  outreach/
    README.md
    dm-templates/
      cold-outreach.md           ← Sovuq DM shablonlar
      follow-up.md               ← Follow-up ketma-ketlik
    leads/
      pipeline.md                ← Lead pipeline
```

---

## 💬 TELEGRAM GURUH

**RAOS Marketing guruh:** https://t.me/+R-suQLCkofI2NzFi
- Haftalik hisobotlar shu yerda
- Kreativlar approval
- Lead gen natijalar

---

## 🚀 ONBOARDING (Birinchi hafta)

```
Kun 1: CLAUDE_MARKETING.md o'qi → /brand skill → brand guidelines yarat
Kun 2: /instagram-marketing → 1 oylik kontent reja yarat → docs/marketing/strategy/
Kun 3: Reels creator agent → 1ta Reel scenariy yoz
Kun 4: /ads → Meta Ads strategiya → docs/marketing/ads/
Kun 5: /lead-generation → DM shablonlar → docs/outreach/dm-templates/
```

---

## ⚠️ NЮANSLAR

```
1. CLONE yasama kontentdan SAQLAN — Meta algo'si unique kontentni ko'taradi
2. Uzbekistanda B2B meta ads: Lookalike > Interest targetlash
3. Instagram DM limit: 50–100 DM/kun (ban xavfi bor)
4. Stories poll — eng yuqori engagement uz bozorida
5. Reel thumbnail matn O'zbek tilida bo'lsin (lotin)
6. Call-to-action: "Bio'dagi link" emas → "Bio linkga o'ting"
7. Comment engagement signal: birinchi 30 daqiqa muhim
8. Hashtag: 3–5 ta niche (#raosuz #kassatizim #dokonboshqaruv)
9. UGC (user generated content): mijozlardan video so'rash → eng ishonchli
10. Video format: 9:16 (1080×1920) Reels, 4:5 (1080×1350) Feed
```

---

---

## 🤖 AI COUNCIL TIZIMI

### Arxitektura

TezCode Bot (Desktop/tezcode-bot/) asosida 3 AI-persona ishlaydi:

```
RAOS AI Council Telegram guruhi:
  🎨 Creator Bot    — Kontent yaratadi (30-kun rejadan)
  🏷️ Brand Reviewer — Brand voice, ton, vizual tekshiradi
  📊 SEO Reviewer   — Hashtag, CTA, format, uzunlik tekshiradi
```

### Kunlik workflow (avtomatik)

```
09:00 — Creator Bot:
  1. docs/marketing/strategy/30-day-plan-*.md dan bugungi vazifani oladi
  2. Caption + hashtag + vizual tavsif + CTA generatsiya qiladi
  3. AI Council chatga yuboradi: "📝 Bugungi post: [kontent]"

09:01-09:55 — Review Botlar:
  Brand Bot → brand guidelines tekshiradi → pravki yoki ✅
  SEO Bot → hashtag/CTA/format tekshiradi → pravki yoki ✅

  Creator Bot → pravkalarni o'qiydi → v2, v3... yaratadi
  → Barcha ✅ bo'lgach = CONSENSUS

10:00 — Auto-post:
  ✅ Consensus → Telegram kanalga post + Instagram draft
  ❌ Consensus yo'q (1 soat) → Ibrat ga xabar: "Qo'lda qaror kerak"
```

### Council statusi

```
drafting  → kontent yaratilmoqda
reviewing → reviewerlar tekshirmoqda
approved  → barcha ✅ berdi
posted    → avtomatik post qilindi
manual    → Ibrat qo'lda hal qilishi kerak
```

---

## ⏰ CRON TRIGGERLAR

| # | Vazifa | Vaqt | Turi |
|---|--------|------|------|
| 1 | AI Council: kontent yaratish | 09:00 har kuni (Du-Ju) | RemoteTrigger |
| 2 | AI Council: auto-post | 10:00 har kuni (Du-Ju) | Bot cron |
| 3 | Haftalik kontent reja | Dushanba 08:00 | RemoteTrigger |
| 4 | Lead scanning | 10:30 har kuni (Du-Ju) | RemoteTrigger |
| 5 | Raqobat tahlili | Har oyning 1-sanasi 09:00 | RemoteTrigger |
| 6 | Haftalik hisobot | Juma 16:00 | RemoteTrigger |
| 7 | 30 kunlik reja | Har oyning 25-sanasi 10:00 | RemoteTrigger |
| 8 | Telegram kanal post | 17:00 har kuni (Du-Ju) | Bot cron |

---

## 📢 TELEGRAM KANAL + BOSHQA TARMOQLAR

### Telegram kanal (@raosuz)
- Formatlar: keys, tips, yangiliklar, so'rovnomalar
- Kross-posting: Instagram → Telegram (format moslashtirish)
- Grammy orqali auto-post: `bot.api.sendMessage(CHANNEL_ID, ...)`

### Instagram (@raosuz)
- Meta Graph API orqali (Business Account kerak)
- Formatlar: Reel, Carousel, Story, Feed post
- Avtomatik: AI Council dan approved kontent

### Facebook
- Instagram bilan birga (Meta Graph API)

### YouTube Shorts
- YouTube Data API v3 (alohida OAuth)
- Reels ni Shorts formatiga moslashtirish

---

_CLAUDE_MARKETING.md | RAOS Marketing | v2.0 | 2026-06-02 — AI Council + Cron + Multi-platform qo'shildi_
