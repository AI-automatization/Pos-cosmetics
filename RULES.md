# RAOS — DEVELOPMENT RULES
# Barcha dasturchilar va Claude CLI uchun MAJBURIY qoidalar

---

## ⛔ WORKING ENDPOINTS — O'ZGARTIRISH TAQIQLANGAN

**Agar endpoint hozir to'g'ri ishlayapti (200/201 qaytaradi) —
uning method, path, request body, response strukturasi HECH QACHON o'zgartirilmaydi.**

```
✅ Faqat shu holatlarda endpoint o'zgartiriladi:
  - Endpoint 4xx / 5xx xato qaytaryapti
  - Endpoint umuman mavjud emas (yangi feature)
  - Endpoint hujjatlashtirilgan kontrakt bilan ziddiyatda

❌ TAQIQLANGAN:
  - Ishlayotgan endpoint path ni o'zgartirish
  - Ishlayotgan endpoint request/response strukturasini o'zgartirish
  - Web, POS, Mobile ishlatayotgan endpoint-larni "yaxshilash" bahonasida buzish
  - Bot yoki Worker uchun API endpoint-larini o'zgartirish
    → Bot/Worker uchun yangi logika = faqat bot/worker ichida, yangi fayllarda
```

---

## 🔀 ZONA QOIDALARI (CLAUDE.md dan)

```
apps/api/     → Polat / Bekzod zonasi
apps/worker/  → Polat / Bekzod zonasi
apps/bot/     → Polat / Bekzod zonasi
apps/web/     → AbdulazizYormatov zonasi
apps/pos/     → AbdulazizYormatov zonasi
apps/mobile/  → Ibrat zonasi
packages/*    → Kelishib o'zgartirish (hammaga xabar)
prisma/       → Polat / Bekzod boshqaradi
```

---

## 🤖 CLAUDE CLI UCHUN QOIDA

```
1. Har sessiyada avval docs/Tasks.md o'qi
2. Faqat tasklarda ko'rsatilgan fayllarni o'zgartir
3. Ishlayotgan endpoint-larga TEGINMA
4. Har o'zgarishdan avval faylni o'qi (Read tool)
5. Bot/Worker o'zgarishlari API endpoint-larini o'zgartirmaydi
6. Yangi endpoint kerak bo'lsa → Tasks.md ga yoz, kelishib ol
```

---

## 📋 JORIY ISHLASH TARTIBI

```
BOT (apps/bot/)  → T-125 → T-126 → T-127 → T-128 → T-129
                   Auth    Tenant   Role     Cron     Test
                      ↓
WORKER (apps/worker/) → Bot to'liq tayyor bo'lgandan keyin
```

---

_RULES.md | RAOS | 2026-03-10_
