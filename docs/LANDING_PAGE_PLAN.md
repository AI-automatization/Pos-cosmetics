# RAOS Landing Page + Video Tutorials — Master Plan

## Context

RAOS нужен лендинг для привлечения клиентов и видео-обучалка для онбординга.
Конкуренты: BILLZ ($2.2M/год, 6000 клиентов), YesPOS ($1M/год, 7200 клиентов), Smart Business ($7.7M/год, 80000 клиентов).
У RAOS 0 клиентов — лендинг это ПЕРВЫЙ шаг к продажам.

---

## ЧАСТЬ 1: LANDING PAGE (apps/landing/)

### 1.1 Техническая архитектура

- **Stack:** Next.js 15 + React 19 + Tailwind 4 (как apps/web)
- **Порт:** 3003 (dev) — super-admin уже на 3002
- **Путь:** `apps/landing/`
- **Язык по умолчанию:** Узбекский (с переключателем UZ/RU/EN)
- **SEO:** SSR, meta tags, Open Graph, structured data
- **Деплой:** Vercel или Railway (отдельный сервис)

### 1.2 Файловая структура

```
apps/landing/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── public/
│   ├── logo.svg
│   ├── og-image.png          (1200x630 для соцсетей)
│   ├── icons/                 (feature иконки)
│   └── screenshots/           (скриншоты приложения)
├── src/
│   ├── app/
│   │   ├── layout.tsx         (root layout + шрифты + meta)
│   │   ├── page.tsx           (главная страница — все секции)
│   │   ├── globals.css
│   │   ├── tutorials/
│   │   │   └── page.tsx       (страница видео-обучалки)
│   │   └── privacy/
│   │       └── page.tsx       (политика конфиденциальности)
│   ├── components/
│   │   ├── Header.tsx         (навигация + CTA кнопка)
│   │   ├── Hero.tsx           (главный экран)
│   │   ├── Problems.tsx       (боли клиента → решения)
│   │   ├── HowItWorks.tsx     (3 шага подключения)
│   │   ├── Features.tsx       (6 ключевых функций)
│   │   ├── Comparison.tsx     (таблица vs конкуренты)
│   │   ├── Pricing.tsx        (3 тарифа)
│   │   ├── Testimonials.tsx   (отзывы — placeholder)
│   │   ├── VideoTutorials.tsx  (секция видео)
│   │   ├── FAQ.tsx            (частые вопросы)
│   │   ├── CTA.tsx            (финальный призыв)
│   │   ├── Footer.tsx         (контакты + ссылки)
│   │   └── LanguageSwitcher.tsx
│   └── lib/
│       ├── constants.ts       (тексты, цены, ссылки)
│       └── i18n.ts            (переводы UZ/RU/EN)
```

---

## ЧАСТЬ 2: КОНТЕНТ КАЖДОЙ СЕКЦИИ (точные тексты)

### 2.1 HEADER

```
Логотип: RAOS (слева)
Навигация: Imkoniyatlar | Narxlar | Taqqoslash | Darsliklar | FAQ
Кнопка: "Bepul boshlash" (зеленая, справа)
Переключатель языка: UZ | RU | EN
```

**Sticky на скролле.** При мобильном — бургер-меню.

---

### 2.2 HERO (первый экран — самый важный)

**Заголовок (UZ):**
```
Do'koningiz uchun eng oson kassa tizimi
```

**Подзаголовок:**
```
Internet yo'qmi? Ishlaydi. Soliq cheki? Avtomatik. Telefonda boshqarish? Ha.
30 kun BEPUL sinab ko'ring — karta bog'lash shart emas.
```

**CTA кнопка (большая, зеленая, с пульсирующей анимацией):**
```
Hoziroq bepul boshlash →
```

**Под кнопкой (мелкий текст):**
```
2 daqiqada ro'yxatdan o'ting. Karta kerak emas. Istalgan vaqt bekor qiling.
```

**Правая сторона:** Скриншот/мокап POS интерфейса на планшете и телефоне.

**Социальное доказательство (под hero):**
```
✓ 30+ do'konlar sinab ko'rmoqda  |  ✓ Soliq.uz bilan rasmiy  |  ✓ 24/7 Telegram yordam
```
*(цифры обновляются по мере роста)*

---

### 2.3 PROBLEMS → SOLUTIONS (боли клиента)

**Секция заголовок:**
```
Tanish muammolar? Biz hal qildik.
```

**3 карточки (каждая = боль → решение):**

**Карточка 1: Internet muammosi**
```
Muammo: Internet o'chdi — kassa to'xtadi. Mijozlar kutib turibdi. Savdo yo'qolmoqda.
         BILLZ va YesPOS faqat internet bilan ishlaydi.

RAOS yechimi: Kassa OFFLINE ishlaydi. Internet qaytganda avtomatik sinxronlashadi.
              Viloyatlarda ham — Samarqand, Buxoro, Namangan — muammosiz.

Oddiy tilda: WhatsApp xabar yozgandek — internet kelganda o'zi yuboriladi.
```

**Карточка 2: Soliq jarima**
```
Muammo: Soliq cheki chiqarishni unutdingiz? Jarima 20 BHM = 7,400,000 so'm!
         BILLZ da Soliq.uz YO'Q. Qo'lda chek chiqarish — xato bo'ladi.

RAOS yechimi: Har savdoda AVTOMATIK soliq cheki. QR kod bilan.
              Siz hech narsa qilmaysiz — RAOS o'zi yuboradi.

Oddiy tilda: Telefon raqamni tergandek — siz terdingiz, telefon o'zi qo'ng'iroq qiladi.
```

**Карточка 3: Ko'p do'kon boshqaruvi**
```
Muammo: 3 ta do'koningiz bor. Har biriga alohida dastur. Umumiy hisobot yo'q.
         BILLZ da har do'kon uchun +179,000 so'm to'laysiz.

RAOS yechimi: Barcha do'konlar BITTA telefondan. Bitta dashboard.
              Qaysi do'kon ko'p sotmoqda? Qayerda tovar kam? Real-time.

Oddiy tilda: Uber haydovchi ilovasidek — barcha buyurtmalarni bitta ekranda ko'rasiz.
```

---

### 2.4 HOW IT WORKS (3 qadam)

**Секция заголовок:**
```
3 daqiqada boshlang
```

**Шаг 1:**
```
Raqam: 1
Sarlavha: Ro'yxatdan o'ting
Tavsif: Telegram yoki telefon raqam bilan. 2 daqiqa.
Ikon: Телефон с галочкой
```

**Шаг 2:**
```
Raqam: 2
Sarlavha: Tovarlarni kiriting
Tavsif: Excel fayldan yuklang yoki shtrix-kod skanerlang. Yordamchimiz bor.
Ikon: Штрих-код сканер
```

**Шаг 3:**
```
Raqam: 3
Sarlavha: Sotishni boshlang!
Tavsif: Kassada, telefonda yoki planshetda. Offline ham ishlaydi.
Ikon: Корзина с чеком
```

---

### 2.5 FEATURES (6 ta asosiy imkoniyat)

**Секция заголовок:**
```
Nima uchun RAOS?
```

**Feature 1: Offline Kassa**
```
Ikon: Wi-Fi off
Sarlavha: Internet bo'lmasa ham ishlaydi
Tavsif: Tauri + SQLite texnologiyasi. Savdo, inventar, chek — hammasi offline.
         Internet kelganda o'zi sinxronlashadi. Viloyatlar uchun ideal.
Tag: "Faqat RAOS da"
```

**Feature 2: Soliq.uz Avtomatik**
```
Ikon: Davlat binosi / Shield
Sarlavha: Soliq cheki avtomatik
Tavsif: Har savdoda OFD.uz ga avtomatik yuboriladi. QR kod bilan.
         Jarima xavfi = 0. Siz hech narsa qilmaysiz.
Tag: "BILLZ da YO'Q"
```

**Feature 3: Telefonda Boshqaring**
```
Ikon: Смартфон
Sarlavha: Do'konni telefondan boshqaring
Tavsif: Egasi uchun alohida ilova. Real-time savdo, daromad, xodimlar.
         Kassir uchun alohida ilova. Android + iOS.
Tag: "2 ta ilova"
```

**Feature 4: AI Tahlil (Night Cashier)**
```
Ikon: Robot / Brain
Sarlavha: Sun'iy intellekt sizga maslahat beradi
Tavsif: Kechasi tahlil qiladi — ertalab Telegram ga yozadi:
         "Pomada #5 kam qoldi, buyurtma bering" yoki "O'tgan hafta savdo 15% tushdi".
Tag: "Haqiqiy AI"
```

**Feature 5: Telegram Bot**
```
Ikon: Telegram logo
Sarlavha: Telegram orqali boshqaring
Tavsif: /savdo — bugungi savdo. /qoldiq — tovar qoldig'i. /hisobot — haftalik.
         SMS kerak emas. Bepul. Tez.
Tag: "SMS o'rniga"
```

**Feature 6: Ko'p turdagi biznes**
```
Ikon: Grid / 4 kvadrat
Sarlavha: Har qanday do'kon turi uchun
Tavsif: Kosmetika (expiry tracking), kiyim (razmer/rang), dorixona, oziq-ovqat,
         elektronika, restoran. Bitta platforma — barcha biznes turlari.
Tag: "6 ta yo'nalish"
```

---

### 2.6 COMPARISON TABLE (vs Конкуренты)

**Секция заголовок:**
```
RAOS vs Boshqalar — haqiqiy taqqoslash
```

**Подзаголовок:**
```
Marketing emas — fakt. Har bir ma'lumot tekshirilgan.
```

**Таблица (10 ключевых параметров):**

```
| Parametr                | RAOS         | BILLZ        | YesPOS       | Smart Business |
|-------------------------|-------------|-------------|-------------|----------------|
| Oylik narx (boshlang'ich)| BEPUL (0)   | 299,000      | 100,000      | 112,500        |
| Oylik narx (to'liq)     | 350,000      | 999,000      | 200,000      | 262,500        |
| Bepul sinov             | 30 kun       | 7 kun        | Oy oxirigacha | Noma'lum       |
| O'zi ro'yxatdan o'tish   | HA           | YO'Q (qo'ng'iroq) | HA       | YO'Q (qo'ng'iroq)|
| OFFLINE ishlaydi?        | HA           | YO'Q         | YO'Q         | YO'Q           |
| Soliq cheki (OFD)        | AVTOMATIK    | YO'Q!        | Qo'shimcha   | Qo'shimcha     |
| Telefon ilovasi (POS)    | Android+iOS  | YO'Q         | YO'Q         | YO'Q           |
| Haqiqiy AI tahlil        | HA           | YO'Q (oddiy) | YO'Q (oddiy) | YO'Q           |
| Ingliz tili              | HA           | YO'Q         | YO'Q         | YO'Q           |
| Ko'chmas mulk moduli     | HA           | YO'Q         | YO'Q         | YO'Q           |
```

**Под таблицей — 3 ключевых факта:**
```
1. BILLZ eng katta raqibimiz — lekin OFFLINE yo'q, Soliq yo'q, 3 barobar qimmat.
2. YesPOS eng arzon — lekin RAOS da BEPUL tarif bor. 0 < 100,000.
3. Smart Business eng ko'p mijozli — lekin ular dorixona/ulgurji uchun. Siz uchun EMAS.
```

---

### 2.7 PRICING (Narxlar)

**Секция заголовок:**
```
Oddiy narxlar. Yashirin to'lovlar yo'q.
```

**3 тарифа:**

**Free (Bepul):**
```
Narx: 0 so'm / oy
Uchun: Yangi boshlayotganlar
Imkoniyatlar:
  ✓ 1 ta kassa
  ✓ 100 tagacha tovar
  ✓ Asosiy hisobotlar
  ✓ Telegram bot
  ✓ 14 kun to'liq versiya sinov
  ✗ Soliq cheki (faqat Pro da)
  ✗ AI tahlil
  ✗ Ko'p do'kon
CTA: "Bepul boshlash"
```

**Pro (Asosiy):**
```
Narx: 350,000 so'm / oy (yillik: 262,500/oy — 25% tejash)
Uchun: 1-3 do'konli biznes
Imkoniyatlar:
  ✓ 3 tagacha kassa
  ✓ Cheksiz tovar
  ✓ Soliq cheki (OFD) AVTOMATIK
  ✓ Offline rejim
  ✓ Telefon ilovasi (kassir + egasi)
  ✓ Telegram bot + hisobotlar
  ✓ Telegram yordam
  ✗ AI tahlil
  ✗ API kirish
CTA: "30 kun bepul sinash"
Belgi: "ENG MASHHUR" (yashil badge)
```

**Scale (Kengayish):**
```
Narx: 700,000 so'm / oy (yillik: 525,000/oy — 25% tejash)
Uchun: Ko'p do'konli va investorlar
Imkoniyatlar:
  ✓ Cheksiz kassalar
  ✓ Barcha Pro imkoniyatlari
  ✓ AI tahlil (Night Cashier)
  ✓ Ko'chmas mulk moduli
  ✓ API kirish (integratsiya)
  ✓ Holding dashboard
  ✓ Premium yordam (telefon + Telegram)
  ✓ Shaxsiy menejer
CTA: "Bog'lanish"
```

**Под тарифами — калькулятор экономии:**
```
BILLZ Pro = 999,000/oy = 11,988,000/yil
RAOS Pro  = 350,000/oy = 3,150,000/yil (yillik narxda)
TEJASH:     8,838,000 so'm / yil = 74% arzonroq!
```

---

### 2.8 VIDEO TUTORIALS секция (на лендинге)

**Секция заголовок:**
```
Video darsliklar — 5 daqiqada o'rganing
```

**Подзаголовок:**
```
Hech qanday texnik bilim kerak emas. Qadamba-qadam ko'rsatamiz.
```

**4 видео-карточки (thumbnail + заголовок + длительность):**

```
1. "Ro'yxatdan o'tish va sozlash" — 3 daqiqa
   Tavsif: Akkaunt ochish, do'kon nomi, toifani tanlash, birinchi sozlamalar.

2. "Tovar qo'shish — 3 xil usul" — 5 daqiqa
   Tavsif: Qo'lda kiritish, Excel yuklash, shtrix-kod skanerlash.

3. "Birinchi savdoni qilish" — 4 daqiqa
   Tavsif: Tovar tanlash, chegirma berish, to'lov qabul qilish, chek chiqarish.

4. "Hisobotlarni ko'rish" — 3 daqiqa
   Tavsif: Kunlik savdo, top tovarlar, foyda, Telegram orqali olish.
```

**Кнопка внизу:**
```
"Barcha darsliklarni ko'rish →" (ведет на /tutorials)
```

---

### 2.9 FAQ (Ko'p beriladigan savollar)

**10 вопросов:**

```
1. RAOS nima?
   → RAOS — bu do'konlar uchun kassa dasturi. Kompyuter, planshet yoki telefonda ishlaydi.
     Tovar sotish, hisobot olish, soliq cheki chiqarish — hammasi bitta joyda.
     WhatsApp kabi oddiy, lekin do'koningiz uchun.

2. BILLZ dan nimasi yaxshi?
   → 3 ta asosiy farq:
     1) RAOS OFFLINE ishlaydi (BILLZ — faqat internet bilan)
     2) RAOS da Soliq cheki AVTOMATIK (BILLZ da umuman YO'Q)
     3) RAOS 74% arzonroq (350K vs 999K oyiga)

3. Internet bo'lmasa ishlaydi deb, qanday?
   → Kassadagi barcha ma'lumotlar telefon/kompyuterda saqlanadi.
     Savdo qilasiz — ma'lumot "navbatga" turadi.
     Internet kelganda — avtomatik serverga yuboriladi.
     Xuddi offline rejimda yozilgan xabar — internetda o'zi yuborilgandek.

4. Soliq cheki qanday ishlaydi?
   → Siz tovar sotsangiz — RAOS avtomatik OFD.uz ga chek yuboradi.
     QR kodli chek chiqadi. Mijoz skanerlab tekshirishi mumkin.
     Siz HECH NARSA qilmaysiz. Jarima xavfi = 0.

5. Necha so'm turadi?
   → BEPUL boshlash mumkin (1 kassa, 100 tovar).
     To'liq versiya: 350,000 so'm/oy (BILLZ dan 74% arzon).
     30 kun bepul sinab ko'ring — karta bog'lash kerak emas.

6. Telefonda ishlaydimi?
   → Ha! 2 ta ilova bor:
     1) Kassir ilovasi — telefonda savdo qilish
     2) Egasi ilovasi — hisobotlar, boshqaruv, bildirishnomalar
     Android va iOS.

7. Qanday qilib boshlash mumkin?
   → 1) raos.uz ga kiring
     2) Telegram yoki telefon raqam bilan ro'yxatdan o'ting (2 daqiqa)
     3) Tovarlarni kiriting (Excel yoki qo'lda)
     4) Sotishni boshlang!
     Yordam kerak bo'lsa — Telegram @raos_support yozing.

8. Ma'lumotlarim xavfsizmi?
   → Ha. Bank darajasidagi shifrlash (AES-256). Har kunlik backup.
     Faqat siz va ruxsat bergan xodimlar ko'radi.
     O'zbekiston qonunlariga to'liq mos (O'RQ-547).

9. 1C bilan ishlaydimi?
   → Hozircha yo'q, lekin rejalashtirilgan (2026 3-chorak).
     Excel export/import allaqachon ishlaydi.

10. Yordam kerak bo'lsa nima qilaman?
    → Telegram: @raos_support (24/7)
      Telefon: +998 XX XXX XX XX (ish kunlari 9:00-18:00)
      Video darsliklar: raos.uz/tutorials
```

---

### 2.10 CTA (Final Call to Action)

```
Sarlavha: Hali o'ylayapsizmi?

Tavsif: Har kuni RAOS siz 1 kun ortda qolasiz.
        Raqobatchilar allaqachon foydalanmoqda.
        30 kun bepul — yo'qotadigan narsangiz yo'q.

Katta tugma: "Hoziroq bepul boshlash →" (yashil, pulsatsiyali animatsiya)

Ostida: "2 daqiqada ro'yxatdan o'ting. Karta kerak emas."
```

---

### 2.11 FOOTER

```
Chap ustun:
  RAOS logotipi
  "Do'konlar uchun eng oson kassa tizimi"
  © 2026 Tezcode LLC

O'rta ustun:
  Mahsulot: Imkoniyatlar | Narxlar | Taqqoslash
  Yordam: Darsliklar | FAQ | Aloqa
  Huquqiy: Maxfiylik siyosati | Foydalanish shartlari

O'ng ustun:
  Telegram: @raos_support
  Instagram: @raos.uz
  Email: hello@raos.uz
  Telefon: +998 XX XXX XX XX
```

---

## ЧАСТЬ 3: VIDEO TUTORIALS (Видео обучалка)

### 3.1 Страница /tutorials

Отдельная страница с полным списком видео-уроков, разделенных по категориям.

### 3.2 Видео-скрипты (8 видео)

**Категория: Boshlash (Начало)**

---

**Video 1: "RAOS ga xush kelibsiz — 2 daqiqada boshlang"** (3 мин)

```
[0:00-0:15] Intro
Salom! Men [ism], RAOS jamoasidanman.
Bugun sizga RAOS ni qanday boshlashni ko'rsataman.
Atigi 2 daqiqa — va siz tayyor bo'lasiz.

[0:15-0:45] Ro'yxatdan o'tish
1. raos.uz saytiga kiring
2. "Bepul boshlash" tugmasini bosing
3. Telegram yoki telefon raqamingizni kiriting
4. SMS kod keladi — kiriting
5. Do'kon nomini yozing (masalan: "Gulnora Cosmetics")
6. Do'kon turini tanlang: Kosmetika

[0:45-1:30] Asosiy sozlamalar
1. Valyuta: UZS (avtomatik)
2. Soliq: STIR raqamingizni kiriting (ixtiyoriy, keyinroq ham mumkin)
3. Filiallar: Asosiy do'kon manzilini yozing
4. Xodimlar: O'zingiz — Admin sifatida avtomatik qo'shilgan

[1:30-2:15] Birinchi tovar qo'shish
1. "Tovarlar" bo'limiga o'ting
2. "+" tugmasini bosing
3. Nomi: "MAC Ruby Woo pomada"
4. Narxi: 250,000 so'm
5. Shtrix-kod: kamera bilan skanerlang YOKI qo'lda kiriting
6. "Saqlash" — tayyor!

[2:15-2:45] Birinchi savdo
1. "Kassa" bo'limiga o'ting
2. Tovarni tanlang (qidiring yoki skanerlang)
3. "To'lash" tugmasini bosing
4. To'lov turi: Naqd / Karta
5. Chek avtomatik chiqadi — QR kod bilan!

[2:45-3:00] Yakuniy
Tabriklaymiz! Siz RAOS da birinchi savdoni qildingiz.
Savollar bo'lsa — Telegram: @raos_support
Keyingi video: "Tovarlarni tez kiritish — 3 xil usul"
```

---

**Video 2: "Tovar qo'shish — 3 xil usul"** (5 мин)

```
[0:00-0:15] Intro
Bugun tovarlarni qanday tez kiritishni ko'rsataman.
3 ta usul bor — qaysi biri qulay bo'lsa, shuni tanlang.

[0:15-1:30] 1-usul: Qo'lda kiritish
- "Tovarlar" → "+" tugma
- Nomi, narxi, kategoriya, shtrix-kod
- Rasm qo'shish (kamera bilan suratga oling)
- Boshlang'ich qoldiq: 50 dona
- "Saqlash"
Qachon ishlatish: 1-10 ta tovar qo'shayotganda

[1:30-3:00] 2-usul: Excel fayldan yuklash
- "Tovarlar" → "Import" tugma
- Namuna faylni yuklab oling (RAOS beradi)
- Excel da to'ldiring: nomi, narxi, shtrix-kod, qoldiq
- Faylni yuklang
- RAOS avtomatik tekshiradi — xato bo'lsa ko'rsatadi
- "Import" tugma — tayyor!
Qachon ishlatish: 10+ tovar kiritayotganda

[3:00-4:15] 3-usul: Shtrix-kod skanerlash
- Kassa yoki telefon kamerasini oching
- Shtrix-kodni skanerlang
- Agar bazada bor — avtomatik to'ldiriladi
- Agar yo'q — faqat narx qo'shing
- Bir-bir skanerlang — tez va oson
Qachon ishlatish: Tayyor tovarlar (qutidagi) uchun

[4:15-4:45] Pro maslahat: Kategoriyalar
- Kategoriya yarating: "Pomada", "Krem", "Atir"
- Tovarni kategoriyaga biriktiring
- Hisobotlarda kategoriya bo'yicha ko'ring
- Kassada tezroq topish uchun

[4:45-5:00] Yakuniy
3 ta usul — qaysi biri qulay bo'lsa shuni tanlang.
Keyingi video: "Birinchi savdoni qilish"
```

---

**Video 3: "Savdo qilish — qadamba-qadam"** (4 мин)

```
[0:00-0:15] Intro
Eng muhim narsa — savdo! Qanday tez va oson savdo qilishni ko'rsataman.

[0:15-1:00] Oddiy savdo
1. "Kassa" ekraniga o'ting
2. Tovarni topish: qidirish yoki shtrix-kod skanerla
3. Tovar ro'yxatga tushdi — miqdorni o'zgartiring (agar kerak)
4. Yana tovar qo'shing
5. "To'lash" tugma

[1:00-1:45] To'lov turlari
- Naqd pul: summani kiriting, qaytim avtomatik hisoblanadi
- Karta: terminal bilan
- Aralash: bir qismi naqd, bir qismi karta
- Click/Payme: QR kod ko'rsating

[1:45-2:30] Chegirma berish
- Tovar tanlangandan keyin "Chegirma" tugma
- Foizda: 10%, 20%, 50%
- Summada: 50,000 so'm chegirma
- RAOS asl narx va chegirma narxni ko'rsatadi

[2:30-3:15] Chek chiqarish
- Savdo tugagach — chek AVTOMATIK chiqadi
- Printer ulangan bo'lsa — qog'ozda chiqadi
- Printer yo'q bo'lsa — Telegram yoki SMS orqali yuborish mumkin
- QR kod — mijoz skanerlasa Soliq tekshiruvi ochiladi

[3:15-3:45] Qaytarish (vozvrat)
- "Savdolar" → qaytarmoqchi bo'lgan savdoni toping
- "Qaytarish" tugma
- Sababni tanlang
- Pul avtomatik qaytariladi — yangi chek chiqadi

[3:45-4:00] Yakuniy
Savdo qilish shu qadar oson. Keyingi video: "Hisobotlar"
```

---

**Video 4: "Hisobotlar — pulni nazorat qiling"** (3 мин)

```
[0:00-0:15] Intro
Do'koningiz qancha topmoqda? Qaysi tovar eng ko'p sotilmoqda?
RAOS barcha javoblarni beradi.

[0:15-1:00] Kunlik hisobot
- "Dashboard" ekrani
- Bugungi savdo: 5,400,000 so'm
- Savdolar soni: 47 ta
- O'rtacha chek: 114,893 so'm
- Eng ko'p sotilgan: MAC Ruby Woo (12 dona)

[1:00-1:45] Daromad va foyda
- "Hisobotlar" → "Daromad"
- Sof daromad = Savdo — Xarajatlar
- Grafik: kunlik, haftalik, oylik
- Eksport: Excel yoki PDF

[1:45-2:30] Telegram orqali hisobot
- Telegram bot: @raos_bot
- /savdo — bugungi savdo
- /top — eng ko'p sotilgan 10 ta tovar
- /qoldiq — kam qolgan tovarlar (alert)
- /hisobot — haftalik PDF hisobot

[2:30-2:45] Egasi ilovasi
- Telefonda real-time: savdo, daromad, xodimlar
- Push-bildirishnoma: "Savdo 1M dan oshdi!" yoki "Tovar X tugadi"

[2:45-3:00] Yakuniy
Siz hamma narsani ko'rasiz — hamma joydan. Keyingi: "Xodimlarni boshqarish"
```

---

**Категория: Boshqaruv (Управление)**

**Video 5: "Xodimlarni boshqarish"** (3 мин)
```
Mavzular:
- Xodim qo'shish (ism, telefon, rol)
- Rollar: Kassir, Menejer, Admin
- Kassir nima qila oladi / nima qila olmaydi
- Smena ochish va yopish
- Xodim hisoboti: kim qancha sotdi
```

**Video 6: "Inventar boshqaruvi"** (4 мин)
```
Mavzular:
- Tovar qoldig'ini ko'rish
- Kam qolgan tovarlar — avtomatik alert
- Tovar qabul qilish (kirim)
- Tovar o'tkazish (filiallar o'rtasida)
- Inventarizatsiya (hisoblash)
- Expiry date tracking (kosmetika uchun)
```

**Video 7: "Ko'p filial boshqaruvi"** (4 мин)
```
Mavzular:
- Yangi filial qo'shish
- Filiallar o'rtasida tovar ko'chirish
- Filial bo'yicha hisobot
- Qaysi filial eng yaxshi ishlayapti?
- Egasi dashboard: barcha filiallar bitta ekranda
```

**Video 8: "Soliq cheki va OFD sozlash"** (3 мин)
```
Mavzular:
- STIR raqamni kiritish
- OFD.uz avtomatik ulash
- Har savdoda chek tekshirish
- QR kod nima uchun kerak?
- Agar chek yuborilmasa nima bo'ladi? (Javob: RAOS o'zi qayta yuboradi)
- Soliq hisoboti — oylik
```

---

### 3.3 Видео-продакшн план

```
Format: Screen recording + voiceover (o'zbek tilida)
Dastur: OBS Studio (bepul) yoki Loom
Davomiyligi: Har biri 3-5 daqiqa
Ovoz: Jamoadan 1 kishi (aniq, sekin gapirish)
Subtitle: O'zbek + Rus (YouTube auto yoki qo'lda)
Musiqa: Fon — past, bepul royalty-free
Joylash: YouTube → raos.uz/tutorials ga embed
Thumbnail: Canva da tayyorlash (shablon)
```

---

## ЧАСТЬ 4: CLAUDE AGENTS VA SKILLS

### 4.1 Agents (`.claude/agents/`)

**Agent 1: `landing-builder.md`**
```
Vazifa: Landing page komponentlarini yaratish va o'zgartirish
Zona: apps/landing/ FAQAT
Tools: Read, Write, Edit, Glob, Grep, Bash
Qoidalar:
  - Tailwind 4 + Next.js 15 App Router
  - Server Components by default
  - SEO: har page da metadata
  - Responsive: mobile-first
  - Performance: next/image, dynamic imports
  - i18n: UZ/RU/EN
  - Accessibility: semantic HTML, aria labels
```

**Agent 2: `video-script-writer.md`**
```
Vazifa: Video darslik skriptlarini yozish va tahrirlash
Zona: docs/video-scripts/ FAQAT
Tools: Read, Write, Edit, Glob, Grep
Qoidalar:
  - O'zbek tilida (oddiy, tushunarli)
  - Har video 3-5 daqiqa
  - Timestamp formatda: [0:00-0:30] Section name
  - Har video oxirida CTA: keyingi video + @raos_support
  - Texnik terminlardan qochish — oddiy so'zlar
```

**Agent 3: `content-writer.md`**
```
Vazifa: Landing page va marketing kontentini yozish
Zona: apps/landing/src/lib/, docs/marketing/
Tools: Read, Write, Edit, Glob, Grep
Qoidalar:
  - 3 tilda: UZ / RU / EN
  - Oddiy til — "tushunmaydigan odam" ham tushunsin
  - Har bir texnik tushunchaga oddiy o'xshatma (analogy)
  - Raqobatchilar haqida FAQAT fakt — yolg'on emas
```

### 4.2 Skills (`.claude/skills/`)

**Skill 1: `/landing`**
```
Vazifa: Landing page development buyruqlari
Misol: /landing add-section testimonials
Misol: /landing update-pricing
Misol: /landing add-language kr (korean)
```

**Skill 2: `/video-tutorial`**
```
Vazifa: Video skript yaratish va tahrirlash
Misol: /video-tutorial new "Chegirma berish"
Misol: /video-tutorial translate 1 ru
Misol: /video-tutorial list
```

---

## ЧАСТЬ 5: JAMOA VAZIFALARI (кто что делает)

| Vazifa | Mas'ul | Muddati | Holat |
|--------|--------|---------|-------|
| Landing page coding | Ibrat | 3-5 kun | Boshlanmagan |
| Kontentni tekshirish (UZ) | Bekzod | 1 kun | Boshlanmagan |
| Kontentni tekshirish (RU) | Bekzod | 1 kun | Boshlanmagan |
| Skrinshot/mockup tayyorlash | Ibrat | 1 kun | Boshlanmagan |
| Video yozish (voiceover) | Jamoa | 2-3 kun | Boshlanmagan |
| Video montaj | Jamoa | 2 kun | Boshlanmagan |
| YouTube kanal ochish | Bekzod | 1 kun | Boshlanmagan |
| Instagram @raos.uz | Bekzod | 1 kun | Boshlanmagan |
| Domain raos.uz sotib olish | CEO | 1 kun | Boshlanmagan |
| Deploy (Vercel/Railway) | Ibrat | 0.5 kun | Boshlanmagan |
| SEO sozlash | Ibrat | 0.5 kun | Boshlanmagan |
| Agent/Skill yaratish | Ibrat | 0.5 kun | Boshlanmagan |

**Umumiy muddat: 1 hafta (asosiy) + 1 hafta (video + polish)**

---

## ЧАСТЬ 6: DESIGN GUIDELINE

```
Ranglar:
  Primary: #2563EB (ko'k — professional, ishonchli)
  Accent:  #10B981 (yashil — CTA, "bepul", "ha")
  Danger:  #EF4444 (qizil — "yo'q", raqobatchilar kamchiligi)
  Text:    #0F172A (qora — asosiy matn)
  Muted:   #64748B (kulrang — ikkinchi darajali)
  Surface: #F8FAFC (och kulrang — fon)
  White:   #FFFFFF (oq — kartochkalar foni)

Shrift:
  Inter — barcha matn uchun
  Sarlavhalar: 800 (Extra Bold)
  Asosiy matn: 400 (Regular)
  Tugmalar: 600 (Semi Bold)

Responsive:
  Mobile-first (360px → 768px → 1024px → 1280px)
  Hero: 1 ustun (mobile) → 2 ustun (desktop)
  Features: 1 ustun → 2 ustun → 3 ustun
  Pricing: stack (mobile) → row (desktop)

Animatsiyalar:
  Scroll da paydo bo'lish (fade-in-up)
  CTA tugma: pulse-glow effekt
  Comparison: yashil/qizil highlight
  Minimal — tezlik birinchi o'rinda
```

---

## ЧАСТЬ 7: DEPLOYMENT VA DOMAIN

```
Domain: raos.uz (sotib olish kerak — action-plan.md da $15/yil)
Hosting varianti A: Vercel (bepul hobby plan yetarli)
Hosting varianti B: Railway (allaqachon ishlatilmoqda)
SSL: Avtomatik (Vercel/Railway)
CDN: Vercel Edge yoki Cloudflare
Analytics: Vercel Analytics yoki Google Analytics 4
```

---

## TEKSHIRISH REJASI (Verification)

1. `pnpm --filter landing dev` — localhost:3003 da ochilishi
2. Mobile view (360px) — barcha seksiyalar to'g'ri ko'rinishi
3. Lighthouse score: Performance 90+, SEO 95+, Accessibility 90+
4. Barcha 3 tilda (UZ/RU/EN) ishlashi
5. CTA tugmalar to'g'ri linkga olib borishi
6. Comparison table mobile da scroll qilishi
7. FAQ accordion ochilishi/yopilishi
8. OG image social share da to'g'ri ko'rinishi
