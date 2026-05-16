# RAOS x ZZone — Collaboration API

> **Base URL:** `https://api.raos.uz/api/v1/zzone`
> **Swagger Docs:** `https://api.raos.uz/api/v1/zzone/docs`
> **Auth:** Header `X-Api-Key`
> **Обновлено:** 2026-05-16

---

## Архитектура

```
┌───────────────────────────────────────────────────────────────────┐
│                     ZZone Backend (Express + MongoDB)              │
│                  zzoneback-production.up.railway.app               │
│                                                                   │
│  При событиях:                                                    │
│  ├─ Клиент заказал → POST api.raos.uz/api/v1/zzone/orders       │
│  ├─ Нужен stock   → GET  api.raos.uz/api/v1/zzone/products/:id/stock │
│  └─ Статус менять → PATCH api.raos.uz/api/v1/zzone/orders/:id/status │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                         REST API (HTTPS)
                         Header: X-Api-Key
                                │
┌───────────────────────────────┴───────────────────────────────────┐
│                     RAOS Backend (NestJS + PostgreSQL)             │
│                          api.raos.uz                               │
│                                                                   │
│  Предоставляет:                                                   │
│  ├─ /api/v1/zzone/products         — товары для витрины          │
│  ├─ /api/v1/zzone/products/:id/stock — остаток real-time         │
│  ├─ /api/v1/zzone/orders           — создание/получение заказов  │
│  ├─ /api/v1/zzone/sellers/:id      — инфо о продавце            │
│  └─ /api/v1/zzone/stores/:id       — инфо о магазине            │
│                                                                   │
│  Автоматически (events):                                          │
│  ├─ Продажа → push stock в ZZone                                 │
│  └─ Приход товара → push stock в ZZone                           │
└───────────────────────────────────────────────────────────────────┘
```

---

## Аутентификация

Все запросы (кроме `/health`) требуют заголовок:

```
X-Api-Key: <ключ>
```

Ключ выдаётся RAOS администратором. Env переменная: `ZZONE_API_KEY`

---

## API Endpoints

### Products

#### `GET /api/v1/zzone/products`

Все активные товары из RAOS.

**Query:**
| Param | Required | Description |
|-------|----------|-------------|
| sellerId | нет | Фильтр по tenant ID |
| page | нет | Страница (default: 1, по 50 шт) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "sellerId": "tenant-uuid",
        "name": "Yog' filtri Toyota Camry",
        "sku": "SKU-001",
        "barcode": "4607123456789",
        "price": 45000,
        "description": "Original, 2015-2020",
        "imageUrl": null,
        "category": "Filtrlar"
      }
    ],
    "pagination": { "total": 120, "page": 1, "pages": 3 }
  }
}
```

---

#### `GET /api/v1/zzone/products/:productId`

Один товар по ID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "sellerId": "tenant-uuid",
    "name": "Yog' filtri Toyota Camry",
    "sku": "SKU-001",
    "barcode": "4607123456789",
    "price": 45000,
    "description": "Original",
    "imageUrl": null,
    "isActive": true,
    "category": "Filtrlar"
  }
}
```

---

#### `GET /api/v1/zzone/products/:productId/stock`

Текущий остаток товара (real-time).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "productId": "uuid",
    "stock": 25,
    "updatedAt": "2026-05-16T10:00:00.000Z"
  }
}
```

---

### Orders

#### `POST /api/v1/zzone/orders`

Создать заказ в RAOS когда клиент ZZone заказал.

**Body:**
```json
{
  "zzoneOrderId": "6649a1b2c3d4e5f6a7b8c9d3",
  "orderNumber": "ZZ-0042",
  "productId": "raos-product-uuid",
  "quantity": 2,
  "unitPrice": 45000,
  "totalPrice": 90000,
  "paymentMethod": "CLICK",
  "clientName": "Aziz",
  "clientPhone": "+998991234567",
  "deliveryAddress": "Toshkent, Chilonzor"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "raosOrderId": "uuid",
    "zzoneOrderId": "6649a1b2c3d4e5f6a7b8c9d3",
    "status": "PENDING",
    "total": 90000,
    "createdAt": "2026-05-16T10:30:00.000Z"
  }
}
```

---

#### `PATCH /api/v1/zzone/orders/:orderId/status`

Обновить статус заказа.

**Body:**
```json
{ "status": "CONFIRMED" }
```

**Statuses:** `PENDING` → `CONFIRMED` → `COMPLETED` | `VOIDED` | `RETURNED`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "status": "CONFIRMED",
    "createdAt": "2026-05-16T10:30:00.000Z"
  }
}
```

---

#### `GET /api/v1/zzone/orders`

Все заказы с origin=ZZONE.

**Query:**
| Param | Required | Description |
|-------|----------|-------------|
| sellerId | нет | Tenant ID filter |
| status | нет | PENDING / CONFIRMED / COMPLETED / VOIDED |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sellerId": "tenant-uuid",
      "status": "PENDING",
      "total": 90000,
      "notes": "ZZone #ZZ-0042 | Aziz | +998991234567 | Chilonzor",
      "createdAt": "2026-05-16T10:30:00.000Z",
      "items": [
        { "productId": "uuid", "quantity": 2, "unitPrice": 45000 }
      ]
    }
  ]
}
```

---

### Sellers

#### `GET /api/v1/zzone/sellers/:sellerId`

Информация о продавце (tenant).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "name": "Avto Zapchast Pro",
    "slug": "avto-zapchast",
    "phone": "+998901234567",
    "city": "Toshkent"
  }
}
```

---

#### `GET /api/v1/zzone/stores/:storeId`

Информация о магазине (branch/filial).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "branch-uuid",
    "sellerId": "tenant-uuid",
    "name": "Chilonzor filiali",
    "address": "Chilonzor, 9-kvartal"
  }
}
```

---

### Health

#### `GET /api/v1/zzone/health`

Проверка доступности API. API key не требуется.

**Response 200:**
```json
{
  "success": true,
  "data": { "status": "ok", "service": "raos-zzone-api" }
}
```

---

## Errors

Все ошибки:
```json
{
  "success": false,
  "error": { "code": "HTTP_401", "message": "Invalid API key" }
}
```

| Code | Meaning |
|------|---------|
| 401 | Нет или неверный `X-Api-Key` |
| 404 | Product / Order / Seller не найден |
| 500 | Внутренняя ошибка RAOS |

---

## Auto-Sync (RAOS → ZZone)

RAOS автоматически пушит обновления stock в ZZone при:
- Продажа через POS (event: `sale.created`)
- Приход/расход товара (event: `inventory.movement`)

Для работы auto-sync нужна настройка в `IntegrationConfig`:
```json
{
  "provider": "ZZONE",
  "config": {
    "token": "<seller JWT от ZZone>",
    "productMappings": {
      "raos-product-uuid": "zzone-product-mongo-id"
    }
  }
}
```

---

## Итого

| Направление | Endpoints | Описание |
|-------------|-----------|----------|
| ZZone → RAOS | 9 endpoints | ZZone дёргает RAOS для товаров/заказов |
| RAOS → ZZone | Event-driven | Auto-push stock при продаже |
| **Swagger** | `https://api.raos.uz/api/v1/zzone/docs` | Интерактивная документация |
