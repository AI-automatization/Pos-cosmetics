# CLAUDE_LANDING.md — Ziyoda Mirazakirova (Landing Page Developer)

# VAQTINCHALIK ROL — Landing page tayyor bo'lgach, vazifa yakunlanadi

---

## ZONA

```
FAQAT shu fayllar bilan ishlash:
  apps/landing/          → Landing page (Next.js 15 + Tailwind v4)

TEGISH MUMKIN EMAS:
  apps/api/              → Backend (Ibrat zonasi)
  apps/web/              → Admin Panel (Ibrat zonasi)
  apps/pos/              → POS Desktop (Ibrat zonasi)
  apps/bot/              → Telegram bot (Ibrat zonasi)
  apps/worker/           → Worker (Ibrat zonasi)
  apps/mobile/           → Mobile Staff (Abdulaziz zonasi)
  apps/mobile-owner/     → Mobile Owner (Abdulaziz zonasi)
  packages/              → Shared packages (kelishib)
  prisma/                → Database (Ibrat zonasi)
  docker/                → Infra (Ibrat zonasi)
```

---

## TECH STACK

| Texnologiya | Versiya | Vazifasi |
|------------|---------|----------|
| Next.js | 15.x | SSG/SSR framework (App Router) |
| React | 19.x | UI library |
| Tailwind CSS | v4 | Styling (PostCSS plugin) |
| TypeScript | 5.x | Type safety |
| lucide-react | latest | Icon library |
| clsx + tailwind-merge | latest | Class name utilities |

**Port:** `3002` (dev server)

---

## LOYIHA MAQSADI

RAOS landing page — **B2B SaaS konversiya sahifasi**. Maqsad:

1. **Mehmonni mijozga aylantirish** — CTA → ro'yxatdan o'tish / demo so'rash
2. **SEO orqali organik trafik** — "POS tizimi Uzbekistan", "kassa dasturi" uchun 1-sahifa
3. **Raqobatchilardan farq** — BILLZ, YesPOS, SmartBusiness dan ustunlik ko'rsatish
4. **Ishonch yaratish** — social proof, raqamlar, case study

### Target Auditoriya

| Segment | Muammo | RAOS yechimi |
|---------|--------|-------------|
| Do'kon egasi (kichik) | Qimmat POS, murakkab sozlash | 30 kun bepul, 5 daqiqada sozlash |
| Tarmoq egasi (3+ filial) | Filiallar nazorat qilib bo'lmaydi | Telefonda real-time boshqaruv |
| Buxgalter | Soliq cheki bilan muammo | OFD integratsiya, avtomatik hisobot |
| Kassir | Tez-tez tizim osilib qoladi | Offline ishlaydi, tez interfeys |

---

## SAHIFA TUZILISHI (Sections)

Landing page quyidagi bo'limlardan iborat bo'lishi SHART:

### 1. Hero Section
```
- Bosh sarlavha (H1) — aniq va kuchli (pain point + yechim)
- Qo'shimcha matn — 1-2 qator, foyda haqida
- CTA tugmasi — "Bepul sinab ko'ring" (primary, yirik)
- Ikkinchi CTA — "Demo ko'rish" (secondary/outline)
- Hero rasm/screenshot — POS interfeys yoki dashboard
- Social proof mini — "500+ do'kon ishonadi" yoki shunga o'xshash
```

### 2. Pain Points (Muammolar)
```
- 3-4 ta muammo kartasi (icon + sarlavha + qisqa tavsif)
  Masalan: "Offline ishlamaydi", "Soliq cheki muammo", "Filiallarni nazorat qilib bo'lmaydi"
- Har kartada → RAOS yechimi ko'rsatiladi
```

### 3. Features (Xususiyatlar)
```
- 6-8 ta asosiy feature
- Har biri: icon + sarlavha + 1 qator tavsif
  - Offline POS
  - Soliq cheki (OFD)
  - Inventar boshqaruvi
  - Moliyaviy hisobot
  - Telefondan boshqaruv
  - Multi-filial
  - Xodimlar boshqaruvi
  - Telegram bildirishnomalar
```

### 4. Comparison Table (Raqobatchilar bilan solishtirish)
```
- Jadval: RAOS vs BILLZ vs YesPOS vs SmartBusiness
- Ustunlar: Narx, Offline, OFD, Multi-filial, Mobile app, API
- RAOS ustunliklari yashil rang bilan ajratiladi
- Ma'lumotlar: docs/competitive-analysis/ dan olish
```

### 5. Pricing (Narxlar)
```
- 2-3 ta tarif rejasi
- Har rejada: nomi, narx, xususiyatlar ro'yxati, CTA
- "30 kun bepul" badge — eng ko'zga tashlanishi kerak
- Yillik to'lovda chegirma ko'rsatish
- Ma'lumotlar: docs/competitive-analysis/pricing-strategy.md dan olish
```

### 6. Social Proof / Testimonials
```
- Mijoz sharhlari (3-4 ta)
- Raqamlar bloki: "500+ do'kon", "10,000+ tranzaksiya/kun", "99.9% uptime"
- Logo band (agar mijoz logolari bo'lsa)
```

### 7. FAQ (Ko'p so'raladigan savollar)
```
- 6-8 ta savol-javob (accordion)
- SEO uchun muhim — schema markup (JSON-LD) qo'shish
  Masalan: "Offline ishlaydimi?", "Narxi qancha?", "Soliq cheki bormi?"
```

### 8. CTA Section (Yakuniy chaqiruv)
```
- Kuchli sarlavha — "Bugunoq boshlang"
- Forma yoki tugma — "Bepul sinab ko'ring"
- Qo'shimcha: telefon raqam, Telegram link
```

### 9. Footer
```
- RAOS logotipi
- Navigatsiya linklari
- Ijtimoiy tarmoq ikonkalari
- Kontakt ma'lumotlari
- Copyright
```

---

## SEO QOIDALARI (MAJBURIY)

### Meta Tags
```typescript
// Har sahifa uchun Metadata export qilish SHART
export const metadata: Metadata = {
  title: 'Sahifa nomi — RAOS',
  description: '155 belgigacha, kalit so\'zlar bilan',
  keywords: ['POS tizimi', 'kassa dasturi', ...],
  openGraph: { ... },
};
```

### Texnik SEO
```
✓ Semantic HTML — h1 faqat 1 ta, h2-h6 ierarxiya
✓ Alt text — barcha rasm uchun o'zbek tilida
✓ Canonical URL — duplikatdan himoya
✓ Sitemap — next-sitemap yoki qo'lda
✓ robots.txt — to'g'ri sozlash
✓ Schema markup (JSON-LD) — Organization, Product, FAQ
✓ Core Web Vitals — LCP < 2.5s, FID < 100ms, CLS < 0.1
✓ next/image — barcha rasmlar uchun (lazy loading + optimization)
✓ next/font — Google Fonts o'rniga local font (performance)
✓ Til: uz (O'zbek) — <html lang="uz">
```

### Kalit so'zlar (Target Keywords)
```
Asosiy:
  - "POS tizimi Uzbekistan"
  - "kassa dasturi"
  - "do'kon boshqaruv dasturi"
  - "soliq cheki dasturi"
  - "offline kassa"

Qo'shimcha:
  - "BILLZ alternativa"
  - "arzon POS tizimi"
  - "filial boshqaruvi dasturi"
  - "inventar dasturi"
  - "moliyaviy hisobot dasturi"
```

---

## DIZAYN QOIDALARI

### Ranglar
```
Primary:    #2563EB (blue-600) — CTA, linklar, accent
Secondary:  #1E293B (slate-800) — matn
Background: #FFFFFF (white) — asosiy fon
Surface:    #F8FAFC (slate-50) — alternativ section fon
Accent:     #10B981 (emerald-500) — success, ustunliklar
Danger:     #EF4444 (red-500) — raqobatchi kamchiliklari
```

### Typography
```
Font: Inter (Google Fonts — allaqachon ulangan)
H1:   text-4xl md:text-5xl lg:text-6xl font-extrabold
H2:   text-3xl md:text-4xl font-bold
H3:   text-xl md:text-2xl font-semibold
Body: text-base md:text-lg font-normal
Small: text-sm text-slate-500
```

### Layout
```
Container:  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Section:    py-16 md:py-24 (katta oraliq)
Grid:       grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
```

### Responsive
```
Mobile-first dizayn (min-width breakpoints):
  sm: 640px   — kichik planshet
  md: 768px   — planshet
  lg: 1024px  — noutbuk
  xl: 1280px  — katta ekran
  
Har element BARCHA ekranlarda chiroyli ko'rinishi SHART.
Mobile da: 1 ustunli, kattaroq tugmalar, yaqinroq oraliq.
```

---

## KOMPONENT ARXITEKTURASI

```
apps/landing/src/
  app/
    layout.tsx           → Root layout (metadata, font, body)
    page.tsx             → Bosh sahifa (barcha sectionlar)
    globals.css          → Global styles + Tailwind
    tutorials/           → Tutorial sahifalari (SEO uchun)
  components/
    layout/
      Header.tsx         → Navigatsiya (sticky, transparent → solid on scroll)
      Footer.tsx         → Footer (kontakt, linklar, copyright)
    sections/
      HeroSection.tsx    → Hero (H1 + CTA + rasm)
      PainPoints.tsx     → Muammolar bo'limi
      Features.tsx       → Xususiyatlar grid
      Comparison.tsx     → Raqobatchilar jadvali
      Pricing.tsx        → Tarif rejalari
      Testimonials.tsx   → Mijoz sharhlari
      FAQ.tsx            → Savollar (accordion)
      CTASection.tsx     → Yakuniy chaqiruv
    ui/
      Button.tsx         → Primary, Secondary, Outline variantlar
      Card.tsx           → Xususiyat/muammo kartasi
      Badge.tsx          → "Bepul", "Mashhur", "Yangi" badge
      Accordion.tsx      → FAQ uchun ochiluvchi element
      ComparisonRow.tsx  → Solishtirish jadvali qatori
    icons/
      index.ts           → lucide-react re-export (kerakli ikonlar)
  lib/
    data.ts              → Static data (features, pricing, FAQ)
    seo.ts               → JSON-LD schema generators
  types/
    index.ts             → Landing-specific types
```

### Qoidalar
```
✓ Har komponent — BITTA fayl, BITTA vazifa (SRP)
✓ Props — TypeScript interface bilan aniqlash
✓ Styling — FAQAT Tailwind class (inline style TAQIQLANGAN)
✓ Rasmlar — next/image bilan (width/height MAJBURIY)
✓ Ikonlar — lucide-react dan (o'z SVG qo'shma, kerak bo'lsa so'ra)
✓ Data — components/ da hardcode qilma → lib/data.ts ga chiqar
✓ 400+ qator TAQIQLANGAN — bo'lish kerak
✓ Server Components default — "use client" faqat interaktiv komponent uchun
```

---

## PERFORMANCE CHECKLIST

```
✓ Static Generation (SSG) — landing page statik, API kerak emas
✓ next/image — barcha rasmlar optimized (WebP, lazy load)
✓ next/font — Inter font local yuklanadi
✓ Code splitting — har sahifa alohida bundle
✓ Minimal JS — interaktivlik faqat kerak joyda ("use client")
✓ No external scripts — Google Analytics faqat production da (agar kerak)
✓ Lighthouse score target: 90+ (Performance, SEO, Accessibility, Best Practices)
✓ Bundle size — kichik tutish (lucide-react tree-shaking qiladi)
```

---

## ACCESSIBILITY (A11Y)

```
✓ Semantic HTML — nav, main, section, article, footer
✓ ARIA labels — tugmalar, formalar uchun
✓ Keyboard navigation — Tab orqali barcha interaktiv elementlar
✓ Color contrast — WCAG AA minimum (4.5:1 matn, 3:1 katta matn)
✓ Alt text — barcha rasmlar uchun ma'noli tavsif
✓ Focus visible — focus ring ko'rinishi
✓ Screen reader — yashirin matn (sr-only) kerak joyda
```

---

## LOCAL DEVELOPMENT

```bash
# Landing dev server:
pnpm --filter landing dev     # → http://localhost:3002

# Type check:
pnpm --filter landing typecheck

# Lint:
pnpm --filter landing lint

# Build (production test):
pnpm --filter landing build
```

---

## GIT QOIDALARI (Ziyoda uchun)

```bash
# Branch format:
ziyoda/feat-[feature-name]
ziyoda/fix-[bug-description]

# Commit format:
feat(landing): add hero section
fix(landing): fix mobile responsive
style(landing): update pricing card design
refactor(landing): extract Button component

# FAQAT apps/landing/ fayllarini o'zgartirish!
# PR ochishdan oldin tekshir:
git diff main --name-only | grep -v "^apps/landing/"
# Agar natija bo'sh EMAS → zona buzilgan → to'xta va so'ra
```

---

## MA'LUMOT MANBALARI

```
Raqobat tahlili va narxlar uchun:
  docs/competitive-analysis/comparison-matrix.md  → Feature solishtirish
  docs/competitive-analysis/pricing-strategy.md   → Narx strategiya
  docs/competitive-analysis/BILLZ.md              → BILLZ tahlili
  docs/competitive-analysis/YesPOS.md             → YesPOS tahlili
  docs/competitive-analysis/SmartBusiness.md       → SmartBusiness tahlili
  docs/competitive-analysis/target-segments.md    → Maqsadli segmentlar

Hobbit (Analitik) bilan ishlash:
  - Kontent va matn → Hobbit tayyorlaydi (docs/content/)
  - Ziyoda → HTML/CSS qismini amalga oshiradi
  - Raqobat ma'lumotlari → Hobbit yangilab turadi
```

---

## TAQIQLANGAN

```
❌ Backend API ga so'rov (landing statik sahifa — API kerak emas)
❌ Database bilan ishlash
❌ Authentication/JWT logika
❌ Boshqa apps/ papkalariga teginish
❌ packages/ ni o'zgartirish (kelishmasdan)
❌ console.log (production da)
❌ Inline styles (faqat Tailwind)
❌ any type
❌ 400+ qatorli fayl
❌ Rasm fayllarni Git ga qo'shish (public/ da saqlash, optimize qilish)
❌ External JS kutubxonalar (jQuery, lodash va h.k.) — kerak emas
```

---

_CLAUDE_LANDING.md | RAOS | v1.0 | 2026-05-19 — Ziyoda Mirazakirova uchun yaratildi (VAQTINCHALIK)_
