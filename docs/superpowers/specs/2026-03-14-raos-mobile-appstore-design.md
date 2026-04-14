# RAOS Mobile — App Store & Arxitektura Dizayn Spesifikatsiyasi
# Sana: 2026-03-14
# Muallif: Abdulaziz (iOS Mobile)

---

## 1. MAHSULOT TAVSIFI

**Nom:** RAOS — Biznes Boshqaruv Tizimi
**Bundle ID:** uz.raos.mobile
**Version:** 1.0.0
**Platforma:** iOS (React Native + Expo)
**Monetizatsiya:** Oylik obuna (14 kun bepul trial)

**Asosiy g'oya:** Barcha O'zbekiston tadbirkorlari uchun
"hammasi bitta joyda" — smena, savdo, nasiya, ombor, hisobot.

**Target foydalanuvchilar:**
- Kichik do'kon egasi (o'zi ham kassir)
- Ko'p filial biznes egasi
- Kassir / xodim

---

## 2. APP STORE SAHIFASI

### Nom va Metadata
```
App nomi:    RAOS
Subtitle:    Biznes boshqaruv tizimi
Kategoriya:  Business
Age Rating:  4+
Narx:        Bepul yuklab olish → Oylik obuna
Keywords:    kassa, pos, savdo, nasiya, do'kon, biznes,
             hisobot, smena, tovar, tadbirkor, uzbekistan
```

### Description (O'zbek)
```
RAOS — O'zbekiston tadbirkorlari uchun yagona biznes boshqaruv tizimi.

📦 DO'KON, CAFE, APTEK, XIZMAT BIZNESI — barchasi uchun bir xil ishlaydi.

— Smena ochish va yopish
— Mahsulot/xizmat sotish (naqd, karta, nasiya)
— Nasiya boshqaruvi + avtomatik eslatmalar
— Tovar kirim va ombor nazorati
— Bosh omborda buyurtma yozish
— Kunlik/haftalik/oylik hisobotlar
— Ko'p filial boshqaruvi
— Barcode scanner
— O'zbek / Rus / Ingliz tilida

💳 14 kun bepul sinab ko'ring. Keyin oylik obuna.
```

### Screenshots (6.7" iPhone 15 Pro Max)
```
1. Dashboard — daromad, statistika
2. Savdo — POS mahsulot grid
3. Nasiya — qarz boshqaruvi
4. Smena — hisobot
5. Ombor — tovar zaxirasi + buyurtma
6. Login — til tanlash bilan
```

---

## 3. O'RNATISHDAN KEYINGI FLOW (A → B)

### A: Yuklab olish
```
App Store → "Olish" → O'rnatish → Ochish
```

### B: Splash Screen
```
RAOS logo → 2 soniya → Onboarding
```

### C: Onboarding (faqat birinchi marta)
```
1. Biznes turi tanlash:
   🏪 Do'kon | ☕ Cafe | 💊 Dorixona | ✂️ Xizmat | 📦 Boshqa

2. Trial ekrani:
   "14 kun bepul sinab ko'ring"
   [Boshlash] / [Hisobim bor]
```

### D: Permissions
```
1. Face ID / Touch ID — tezroq kirish uchun
2. Push Notifications — nasiya eslatmalari uchun
3. Kamera — birinchi barcode scan da avtomatik
```

### E: Login
```
Yangi:    Telefon → SMS kod → Parol → Biznes ma'lumotlari
Mavjud:   Email/telefon + parol → yoki Face ID
```

### F: Rol aniqlash
```
Login → Backend dan rol keladi → Mos interfeys
```

### G: Empty State (birinchi kirish)
```
"Salom, [Ism]! Boshlaylik:"
☐ Mahsulot qo'shing
☐ Smena oching
☐ Birinchi savdo
[Sozlashni boshlash]
```

### H: Kundalik ishlatish
```
Kassir: Smena ochish → Savdo → Nasiya → Ombor nazorat → Smena yopish
Egasi:  Dashboard → Hisobotlar → Nasiya nazorat → Buyurtmalarni tasdiqlash
```

---

## 4. ROL BO'YICHA EKRANLAR ARXITEKTURASI

### KASSIR (CASHIER) — Tab tuzilmasi
```
┌────────┬────────┬────────┬────────┬────────┐
│   ⏱️   │   🛒   │   📋   │   💳   │   📦   │
│ Smena  │ Savdo  │ Tarix  │ Nasiya │ Ombor  │
└────────┴────────┴────────┴────────┴────────┘
```

**Smena tab:**
- Faol smena holati (ochish/yopish)
- Kunlik statistika (tushum, naqd, karta, nasiya)
- Smena tarixi

**Savdo tab:**
- Mahsulot grid (kategoriya, qidiruv, barcode)
- Savat + to'lov (naqd, karta, nasiya)
- Chek

**Tarix tab:**
- Savdo ro'yxati (bugun/hafta)
- Savdo detallari

**Nasiya tab:**
- Mijoz qarzlari
- To'lov qabul qilish
- Telegram eslatma yuborish

**Ombor tab:**
- Filial ombori (qancha qolgan)
- Kam qolgan tovarlar (rang bilan belgilanadi)
- Kirim tarixi
- ⭐ Bosh omborda buyurtma yozish

**Kassir QILA OLMAYDI:**
```
❌ Narx o'zgartirish
❌ Manual tovar qo'shish/o'chirish
❌ Bosh ombor zaxirasini ko'rish
❌ Daromad/foyda tahlili
❌ Boshqa kassirlar ma'lumotlari
```

---

### EGASI (OWNER) — Tab tuzilmasi
```
┌──────────┬────────┬────────┬──────────┬────────┐
│    📊    │   📈   │   💳   │    📦    │   ⚙️   │
│Dashboard │Hisobot │ Nasiya │ Tovarlar │Sozlamalar│
└──────────┴────────┴────────┴──────────┴────────┘
```

**Dashboard tab:**
- Real-time daromad (bugun/hafta/oy toggle)
- Faol smena holati
- To'lov taqsimoti (naqd/karta/nasiya %)
- Kam qolgan tovarlar alert
- Muddati o'tgan nasiyalar alert
- Kassirlar faolligi

**Hisobot tab:**
- Kunlik/haftalik/oylik grafik
- Eng ko'p sotiladigan tovarlar
- Foyda/zarar

**Nasiya tab:**
- Barcha filiallar nasiyasi (umumiy)
- Muddati o'tganlar

**Tovarlar tab:**
- Barcha filiallar ombori
- Kassirlarning buyurtmalari (tasdiqlash/rad)
- Tovar qo'shish/narx o'zgartirish

**Sozlamalar tab:**
- Profil, biznes ma'lumotlari
- Xodimlar boshqaruvi
- Bildirishnomalar
- Obuna holati
- Til tanlash

---

## 5. OMBOR BUYURTMA FLOW (Kassir → Egasi)

```
Kassir:
  Ombor tab → "Buyurtma yozish" →
  Tovar tanlash + miqdor + izoh →
  Yuborish

Egasi:
  Push notification →
  Tovarlar tab → Buyurtmalar →
  [Tasdiqlash] / [Rad etish]

Kassir:
  Notification → Buyurtma holati yangilandi
  (Yuborildi → Ko'rib chiqilmoqda → Tasdiqlandi → Yetkazildi)
```

---

## 6. TEXNIK TALABLAR (App Store uchun)

### Build
```
Hozir:   Expo Go (test)
Kerak:   EAS Build → .ipa → TestFlight → App Store
```

### Apple Developer
```
- Apple Developer Account: $99/yil
- App Store Connect: yangi app
- Privacy Policy URL: raos.uz/privacy
```

### Tuzatilishi kerak bo'lgan muammolar
```
P0:
  1. App icon yo'q (assets/icon.png — 1024×1024)
  2. Splash screen yo'q (app.json da config)
  3. Dashboard ekrani bo'sh
  4. expo-camera version: 16.x → 17.x

P1:
  5. Mock data → Real API
  6. Onboarding ekrani
  7. Settings ekrani
  8. EAS Build sozlamalari
```

### Chiqish vaqt rejasi
```
Hafta 1: Dashboard + Settings + Onboarding
Hafta 2: Mock → Real API
Hafta 3: EAS Build + TestFlight beta
Hafta 4: Screenshots + App Store Connect
Hafta 5: Apple Review → 🚀 LIVE
```

---

## 7. HOZIRGI EKRANLAR HOLATI

| Ekran | Tayyor | Mock/Real |
|-------|--------|-----------|
| Login | ✅ | Mock |
| Biometric | ✅ | Mock |
| Smena | ✅ | Mock |
| Savdo (POS) | ✅ | Mock |
| Savdo Tarixi | ✅ | Mock |
| Nasiya | ✅ | Mock |
| Kirim | ✅ | Mock |
| Dashboard | ❌ Bo'sh | — |
| Settings | ❓ | — |
| Onboarding | ❌ | — |
| Ombor buyurtma | ❌ | — |

---

*RAOS Mobile Design Spec | v1.0 | 2026-03-14*
