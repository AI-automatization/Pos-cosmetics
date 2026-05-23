# 1C Buxgalteriya Integratsiya — Research va Spesifikatsiya

**Mas'ul:** Sardor Madaliev
**Sana:** 2026-05-22
**Issue:** M-9 (#71)

---

## 1. Integratsiya usullari

| Usul | Qanday ishlaydi | Murakkablik |
|------|----------------|-------------|
| **CommerceML XML** | XML fayllar orqali (import.xml, offers.xml, documents.xml) | O'rta |
| **REST API (OData)** | 1C:Enterprise 8.3.5+ da JSON/XML orqali | Past |
| **Direct DB** | PostgreSQL + ODBC ulanishi | Yuqori |
| **SOAP Web Services** | WSDL asosida XML | Yuqori |

**RAOS uchun tavsiya: CommerceML XML** — eng keng tarqalgan, buxgalterlar biladi, kutubxona mavjud.

---

## 2. CommerceML 2.1 nima?

1C.ru tomonidan yaratilgan XML standart. Tovarlar, narxlar, buyurtmalar, to'lovlarni almashtirish uchun.

**3 ta asosiy fayl:**
```
import.xml    → tovar katalogi (nomi, kategoriya, birlik, NDS)
offers.xml    → narxlar va qoldiq miqdorlar
documents.xml → buyurtmalar va sotuvlar
```

---

## 3. RAOS dan 1C ga yuborish kerak bo'lgan ma'lumotlar

### 3.1 Tovarlar (import.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.08" ДатаФормирования="2026-05-22T10:00:00">
  <Классификатор>
    <Группы>
      <Группа>
        <Ид>cat_001</Ид>
        <Наименование>Kosmetika</Наименование>
      </Группа>
    </Группы>
  </Классификатор>
  <Товары>
    <Товар>
      <Ид>prod_001</Ид>
      <Артикул>BARCODE123</Артикул>
      <Наименование>Suv yuvish sabuni</Наименование>
      <БазоваяЕдиница Код="796">dona</БазоваяЕдиница>
      <НДС>12</НДС>
      <Группы>
        <Группа>cat_001</Группа>
      </Группы>
    </Товар>
  </Товары>
</КоммерческаяИнформация>
```

**RAOS → 1C mapping:**
| RAOS (Prisma) | 1C XML |
|---------------|--------|
| `product.id` | `<Ид>` |
| `product.barcode` | `<Артикул>` |
| `product.name` | `<Наименование>` |
| `unit.name` | `<БазоваяЕдиница>` |
| `12%` (O'zbekiston NDS) | `<НДС>` |
| `category.name` | `<Группа>` |

---

### 3.2 Narxlar va qoldiqlar (offers.xml)
```xml
<КоммерческаяИнформация ВерсияСхемы="2.08" ДатаФормирования="2026-05-22T10:00:00">
  <ПакетПредложений>
    <Предложение>
      <Ид>prod_001</Ид>
      <Наименование>Suv yuvish sabuni</Наименование>
      <Цены>
        <Цена>
          <ЦенаЗаЕдиницу>15000</ЦенаЗаЕдиницу>
          <Валюта>UZS</Валюта>
          <ЕдиницаИзмерения>dona</ЕдиницаИзмерения>
        </Цена>
      </Цены>
      <Остатки>
        <Остаток>
          <Склад>
            <Ид>branch_001</Ид>
            <Наименование>Asosiy filial</Наименование>
          </Склад>
          <ОстатокНаСкладе>250</ОстатокНаСкладе>
        </Остаток>
      </Остатки>
    </Предложение>
  </ПакетПредложений>
</КоммерческаяИнформация>
```

**RAOS → 1C mapping:**
| RAOS (Prisma) | 1C XML |
|---------------|--------|
| `product.id` | `<Ид>` |
| `product.price` | `<ЦенаЗаЕдиницу>` |
| `UZS` | `<Валюта>` |
| `branch.id` | `<Склад><Ид>` |
| `stockMovement (net)` | `<ОстатокНаСкладе>` |

---

### 3.3 Sotuvlar (documents.xml)
```xml
<КоммерческаяИнформация ВерсияСхемы="2.08" ДатаФормирования="2026-05-22T10:00:00">
  <Документ>
    <Ид>order_12345</Ид>
    <Номер>1234</Номер>
    <Дата>2026-05-22</Дата>
    <Время>10:30:00</Время>
    <ТипДокумента>Заказ товара</ТипДокумента>
    <Контрагент>
      <Ид>customer_001</Ид>
      <Наименование>Rahmatulla Xolmatov</Наименование>
    </Контрагент>
    <Товары>
      <Товар>
        <Ид>prod_001</Ид>
        <Наименование>Suv yuvish sabuni</Наименование>
        <Количество>5</Количество>
        <ЦенаЗаЕдиницу>15000</ЦенаЗаЕдиницу>
        <Сумма>75000</Сумма>
      </Товар>
    </Товары>
    <Сумма>75000</Сумма>
  </Документ>
</КоммерческаяИнформация>
```

**RAOS → 1C mapping:**
| RAOS (Prisma) | 1C XML |
|---------------|--------|
| `order.id` | `<Ид>` |
| `order.orderNumber` | `<Номер>` |
| `order.createdAt` | `<Дата>` + `<Время>` |
| `customer.firstName + lastName` | `<Контрагент><Наименование>` |
| `orderItem.productName` | `<Товар><Наименование>` |
| `orderItem.quantity` | `<Количество>` |
| `orderItem.unitPrice` | `<ЦенаЗаЕдиницу>` |
| `orderItem.total` | `<Сумма>` |
| `order.total` | `<Сумма>` (document) |

---

## 4. Node.js kutubxonalar

| Paket | Holat | Tavsiya |
|-------|-------|---------|
| `commerceml-parser` | Aktual (v3.0.3, TypeScript) | ✅ TAVSIYA |
| `commerceml-js` | Eskirgan (7 yil) | ❌ |
| `1c` | Eskirgan (6 yil) | ❌ |

**O'rnatish:**
```bash
pnpm add commerceml-parser
```

---

## 5. Raqobatchilar qanday qilgan

| Tizim | 1C integratsiya | Usul |
|-------|----------------|------|
| **BILLZ** | Ha (Pro tarif) | CommerceML XML |
| **YesPOS** | Ha | CommerceML XML |
| **SmartBusiness** | Ha | REST API + CommerceML |
| **RAOS** | Yo'q ❌ | — |

---

## 6. Endpoint dizayni (M-5 dan keyin qilish kerak)

```
GET /api/v1/integrations/1c/export?type=catalog           → import.xml
GET /api/v1/integrations/1c/export?type=offers            → offers.xml
GET /api/v1/integrations/1c/export?type=sales&from=&to=   → documents.xml
```

**Format:** `Content-Type: application/xml`

---

## 7. Amalga oshirish rejasi

| Qadam | Nima | Kim | Holat |
|-------|------|-----|-------|
| 1 | Research + spec | Sardor | ✅ DONE (M-9) |
| 2 | `apps/api/src/integrations/one-c/` yaratish | Ibrat + Sardor | ⏳ |
| 3 | XML generator service | Sardor | ⏳ |
| 4 | Endpoint qo'shish | Ibrat | ⏳ (Ibrat zonasi) |
| 5 | Kunlik cron (avtomatik) | Ibrat | ⏳ |

> ⚠️ **Zona qoidasi:** `apps/api/src/integrations/` — Ibrat zonasi.
> Sardor faqat `apps/api/src/tax/`, `ledger/`, `fiscal/` da ishlaydi.
> Integratsiya kodi uchun Ibrat bilan kelishish kerak.

---

## 8. Xavflar

| Xavf | Yechim |
|------|--------|
| XML katta bo'lishi (10K+ tovar) | Stream-based generation (saxes/xml-writer) |
| Encoding muammo (Cyrillic) | UTF-8 majburiy |
| 1C versiyasi farqi | CommerceML 2.08 — eng keng qo'llab-quvvatlanadi |
| Buxgalter 1C ni bilmasa | Qo'llanma yozish kerak |

---

*Research: Sardor Madaliev | 2026-05-22 | M-9 (#71)*
