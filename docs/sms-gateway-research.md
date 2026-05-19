# T-462: SMS Gateway Research — O'zbekiston SMS Provayderlar

**Sana:** 2026-05-19
**Mas'ul:** Ibrat
**Status:** TAYYORLANDI — AbdulazizYormatov tasdiqlashi kerak

---

## Solishtirish jadvali

| Mezon | PlayMobile | GetSMS | DevSMS | Eskiz | OperSMS |
|-------|-----------|--------|--------|-------|---------|
| **Sayt** | playmobile.uz | getsms.uz | devsms.uz | eskiz.uz | opersms.uz |
| **Narx/SMS** | ~80-120 so'm* | 84 so'm (10K gacha) | 350 so'm (10K+) | 50 so'm | Kelishuv bo'yicha |
| **REST API** | Ha (JSON + Basic Auth) | Ha (HTTP/HTTPS) | Ha (POST endpoint) | Ha (Postman docs) | Ha (PHP + boshqa) |
| **Sandbox/Test** | Yo'q (haqiqiy SMS) | Yo'q | Yo'q | Yo'q | Yo'q |
| **Min depozit** | Kelishuv | Yo'q | Yo'q (Payme/Click) | Yo'q | Yo'q |
| **Ro'yxatdan o'tish** | Yuridik shaxs (shartnoma) | Yuridik shaxs | Jismoniy shaxs ham mumkin | Jismoniy/yuridik | Faqat yuridik shaxs |
| **Alphanumeric sender** | Ha (shartnomada) | Ha (shablon bilan) | Tekshirish kerak | Ha | Ha (shartnomada) |
| **To'lov** | Bank o'tkazma | Bank o'tkazma | Payme/Click/Bank | Payme/Click | Bank o'tkazma (oylik) |
| **Delivery status** | Ha (callback) | Ha (status API) | Ha | Ha | Ha |
| **SDK/Kutubxona** | Python (GitHub) | Yo'q | Yo'q | Go, Node (GitHub) | PHP |
| **Hujjatlar** | wiki.playmobile.uz | getsms.uz | devsms.uz | Postman docs | opersms.uz/page/2 |

*PlayMobile aniq narx saytda ko'rsatilmagan — shartnoma orqali

---

## Har provayderning batafsil tahlili

### 1. PlayMobile (playmobile.uz)
**Afzalliklari:**
- O'zbekistonning eng katta SMS brokeri
- Barcha operatorlar: Beeline, Ucell, UzMobile, Humans
- Wiki dokumentatsiya (wiki.playmobile.uz)
- Basic Auth + JSON REST API
- Yuqori tezlik (1 so'rovda 100 SMS)
- URL: `https://send.smsxabar.uz/broker-api/send`

**Kamchiliklari:**
- Faqat yuridik shaxslar (shartnoma kerak)
- Narx saytda ochiq emas
- Sandbox yo'q
- Ro'yxatdan o'tish 1-3 kun

**API misol:**
```bash
POST https://send.smsxabar.uz/broker-api/send
Authorization: Basic base64(login:password)
Content-Type: application/json

{
  "messages": [{
    "recipient": "998901234567",
    "message-id": "abc123",
    "sms": { "originator": "RAOS", "content": { "text": "Sizning kodingiz: 1234" } }
  }]
}
```

### 2. GetSMS (getsms.uz)
**Afzalliklari:**
- Aniq narx: 84.24 so'm/SMS (10K gacha)
- HTTPS shifrlangan protokol
- Barcha UZ operatorlar
- Shablon tizimi (filtrlash)
- Status tekshirish API

**Kamchiliklari:**
- Yuridik shaxs kerak
- Shablonga mos kelmaydigan SMS — alohida narxlanadi
- Hujjatlar to'liq emas
- SDK yo'q

### 3. DevSMS (devsms.uz)
**Afzalliklari:**
- Eng oson ro'yxatdan o'tish (jismoniy shaxs ham mumkin!)
- Payme/Click orqali to'ldirish
- Oddiy API: `POST https://devsms.uz/api/send`
- Darhol boshlash mumkin

**Kamchiliklari:**
- Narx yuqori: 350 so'm/SMS (korporativ 10K+ bo'lsa)
- Kam ma'lumot hujjatlar
- Kichik provayeder — barqarorligi noma'lum

### 4. Eskiz (eskiz.uz)
**Afzalliklari:**
- Eng arzon: 50 so'm/SMS!
- Oylik to'lov yo'q, miqdorga bog'liq emas
- Postman dokumentatsiya
- Node.js va Go SDK (GitHub)
- Jismoniy shaxs ham ro'yxatdan o'ta oladi
- Payme/Click to'ldirish

**Kamchiliklari:**
- CLAUDE.md da TAQIQLANGAN (2026-03-09 dan Eskiz SMS TAQIQLANGAN)
- Oldingi yomon tajriba (sababi: noma'lum, Polat qaror qilgan)

**MUHIM:** Eskiz eng arzon va texnik jihatdan eng qulay, LEKIN CLAUDE.md da taqiqlangan. Bu qarorni qayta ko'rib chiqish kerak.

### 5. OperSMS (opersms.uz)
**Afzalliklari:**
- Oldindan to'lov yo'q — oy oxirida hisob-kitob
- Miqdor oshganda narx pasayadi
- PHP API tayyor

**Kamchiliklari:**
- Faqat yuridik shaxs + shartnoma
- Aniq narx saytda yo'q
- Ro'yxatdan o'tish murakkab

---

## Tavsiya

### Variant A: Eskiz (agar taqiq olib tashlanadi)
- **Narx:** 50 so'm/SMS — eng arzon
- **Sabab:** Node.js SDK bor, API oddiy, jismoniy shaxs ro'yxatdan o'ta oladi
- **Xavf:** CLAUDE.md da taqiqlangan — JAMOADA MUHOKAMA kerak

### Variant B: PlayMobile (agar yuridik shaxs tayyor)
- **Narx:** ~80-120 so'm/SMS (taxminan)
- **Sabab:** Eng katta va barqaror provayeder, to'liq API docs
- **Xavf:** Shartnoma kerak (1-3 kun), narx ochiq emas

### Variant C: GetSMS (o'rta variant)
- **Narx:** 84 so'm/SMS
- **Sabab:** Aniq narx, HTTPS, barqaror
- **Xavf:** Yuridik shaxs kerak, SDK yo'q (o'zimiz yozamiz)

### TAVSIYA: **PlayMobile** (primary) + **Eskiz** (backup, agar taqiq olib tashlanadi)

**Sabab:**
1. PlayMobile — eng ishonchli, katta bizneslar foydalanadi
2. Eskiz — eng arzon backup (50 so'm vs 84-120)
3. Provider-agnostic adapter pattern: `SmsAdapter` interface → har qanday provayeder almashtirish oson

---

## Keyingi qadam

1. AbdulazizYormatov tasdiqlaydi: qaysi variant?
2. Eskiz taqiqini qayta ko'rib chiqish (CLAUDE.md o'zgartirish kerakmi?)
3. Tanlangan provayederga ro'yxatdan o'tish
4. T-463 da adapter yozish

---

**Manbalar:**
- [PlayMobile](https://playmobile.uz/) — sayt + [API docs](https://wiki.playmobile.uz/)
- [GetSMS](https://getsms.uz/) — sayt + [tarif](https://getsms.uz/page/index/17)
- [DevSMS](https://devsms.uz/?lang=en) — sayt
- [Eskiz](https://eskiz.uz/en/sms) — sayt + [Postman API](https://documenter.getpostman.com/view/663428/TVK5eMco)
- [OperSMS](https://opersms.uz/) — sayt + [API](https://opersms.uz/ru/page/2)
