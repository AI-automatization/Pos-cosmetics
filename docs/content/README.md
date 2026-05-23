# RAOS Kontent Strategiya

Bu papka Hobbit (Analitik & Kontentchi) tomonidan boshqariladi.

## Tuzilishi

```
content/
  landing/          → Landing page uchun matnlar (Ziyoda amalga oshiradi)
  social/
    telegram/       → Telegram kanal postlari
    instagram/      → Instagram postlar
    content-calendar.md → Oylik post rejasi
  blog/
    ideas.md        → Mavzu g'oyalari
    drafts/         → Qoralamalar
    published/      → Chop etilgan
```

## Qoidalar

1. Barcha matnlar O'zbek tilida (lotin alifbosi)
2. Landing matnlari → `landing/` papkaga yoziladi → Ziyoda `apps/landing/` da implement qiladi
3. Har post alohida fayl: `YYYY-MM-DD-topic.md`
4. Raqamlar va statistikalar FAQAT tasdiqlangan manbadan

## Ziyoda bilan sync

- Hobbit `landing/` da matn yozadi
- Ziyoda matnni oladi va HTML/CSS qiladi
- Hobbit natijani tekshiradi va feedback beradi
