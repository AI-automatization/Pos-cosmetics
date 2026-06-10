# RAOS x ZZone — Collaboration API

> **Base URL:** `https://api.raos.uz/api/v1/zzone`
> **Swagger Docs:** `https://api.raos.uz/api/v1/zzone/docs`
> **Auth:** Header `X-Api-Key`
> **Updated:** 2026-05-19

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     ZZone Backend (Express + MongoDB)              │
│                  zzoneback-production.up.railway.app               │
│                                                                   │
│  При событиях:                                                    │
│  ├─ Клиент заказал → POST /zzone/orders                          │
│  ├─ Нужен stock   → GET  /zzone/products/:id/stock               │
│  ├─ Поиск по авто → GET  /zzone/vehicles/:id/products            │
│  └─ Статус менять → PATCH /zzone/orders/:id/status               │
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
│  Предоставляет (25 endpoints):                                    │
│  ├─ /zzone/products (5)      — CRUD товаров + stock              │
│  ├─ /zzone/orders (6)        — CRUD заказов + status             │
│  ├─ /zzone/sellers (3)       — CRUD продавцов                    │
│  ├─ /zzone/stores (3)        — CRUD магазинов                    │
│  ├─ /zzone/vehicles (7)      — авто + совместимость              │
│  └─ /zzone/health (1)        — проверка доступности              │
│                                                                   │
│  Auto-sync (events):                                              │
│  ├─ product.created  → push новый товар в ZZone                  │
│  ├─ product.updated  → push изменения в ZZone                    │
│  ├─ product.deleted  → удалить из ZZone                          │
│  ├─ sale.created     → push stock в ZZone                        │
│  └─ inventory.movement → push stock в ZZone                      │
└───────────────────────────────────────────────────────────────────┘
```

---

## Authentication

Все запросы (кроме `/health`) требуют заголовок:

```
X-Api-Key: <ключ>
```

Ключ настраивается через Super Admin → Tenant → ZZone tab.

---

## AUTO_PARTS Tenant Flow

```
1. Super Admin создаёт tenant с типом "Авто запчасти"
   → Автоматически создаётся IntegrationConfig (provider: ZZONE)
   → Сидятся авто-запчасти категории (Фильтры, Тормоза, Двигатель...)
   
2. Super Admin настраивает ZZone token в tenant detail
   → PATCH /admin/tenants/:id/zzone-config { token: "...", isActive: true }

3. Owner создаёт товар в RAOS → event product.created
   → Sync listener автоматически пушит в ZZone
   → Mapping сохраняется (raosId ↔ zzoneId)

4. Кассир продаёт через POS → event sale.created
   → Stock автоматически обновляется в ZZone

5. Клиент на ZZone ищет по авто → GET /zzone/vehicles/:id/products
   → Находит совместимые запчасти из RAOS
```

---

## API Endpoints — Products (5)

#### `GET /zzone/products`
Все активные товары с `zzoneVisible=true`.

**Query:** `sellerId` (required), `page` (optional, default 1, по 50 шт)

#### `GET /zzone/products/:productId`
Один товар по ID.

#### `GET /zzone/products/:productId/stock`
Текущий остаток (real-time).

#### `PATCH /zzone/products/:productId`
Обновить товар (partial update: name, price, description, imageUrl, isActive).

#### `DELETE /zzone/products/:productId`
Soft delete — товар скрывается из ZZone.

---

## API Endpoints — Orders (6)

#### `POST /zzone/orders`
Создать заказ (origin: ZZONE). Body: `{ zzoneOrderId, orderNumber, productId, quantity, unitPrice, totalPrice, paymentMethod, clientName, clientPhone, deliveryAddress }`

#### `GET /zzone/orders`
Список заказов origin=ZZONE. Query: `sellerId` (required), `status` (optional).

#### `GET /zzone/orders/:orderId`
Детали заказа с items.

#### `PATCH /zzone/orders/:orderId/status`
Обновить статус. Body: `{ status, sellerId }`. Statuses: PENDING → CONFIRMED → COMPLETED | VOIDED | RETURNED.

#### `PATCH /zzone/orders/:orderId`
Редактировать заказ (только в PENDING). Body: `{ sellerId, quantity?, totalPrice?, deliveryAddress?, clientPhone? }`

#### `DELETE /zzone/orders/:orderId`
Отменить заказ (только PENDING/CONFIRMED). Stock восстанавливается. Query: `sellerId`.

---

## API Endpoints — Sellers (3)

#### `GET /zzone/sellers/:sellerId`
Информация о продавце (tenant).

#### `PATCH /zzone/sellers/:sellerId`
Обновить (name, phone, city).

#### `DELETE /zzone/sellers/:sellerId`
Деактивировать — все товары скрываются из ZZone.

---

## API Endpoints — Stores (3)

#### `GET /zzone/stores/:storeId`
Информация о магазине (branch).

#### `PATCH /zzone/stores/:storeId`
Обновить (name, address).

#### `DELETE /zzone/stores/:storeId`
Деактивировать магазин.

---

## API Endpoints — Vehicles (7)

#### `GET /zzone/vehicles`
Список авто. Query: `brand`, `model`, `year` (all optional).

#### `GET /zzone/vehicles/brands`
Уникальные бренды авто.

#### `POST /zzone/vehicles`
Создать авто. Body: `{ brand, model, yearFrom, yearTo?, bodyType? }`

#### `GET /zzone/vehicles/:vehicleId/products`
Совместимые товары для авто. Query: `sellerId` (optional). Для ZZone search.

#### `GET /zzone/products/:productId/vehicles`
Совместимые авто для товара.

#### `POST /zzone/products/:productId/vehicles`
Добавить совместимость. Body: `{ vehicleId, notes? }`

#### `DELETE /zzone/products/:productId/vehicles/:vehicleId`
Удалить совместимость.

---

## API Endpoints — Health (1)

#### `GET /zzone/health`
Проверка доступности. Без API key.

---

## Super Admin Endpoints (3)

Доступны через JWT auth (Super Admin role):

#### `GET /admin/tenants/:id/zzone-config`
Текущая ZZone конфигурация tenant'а.

#### `PATCH /admin/tenants/:id/zzone-config`
Обновить token и isActive. Body: `{ token?, isActive? }`

#### `POST /admin/tenants/:id/zzone-sync`
Триггер bulk sync всех товаров в ZZone.

---

## Auto-Sync Events

| Event | Trigger | Action |
|-------|---------|--------|
| `product.created` | Товар создан в RAOS | Push в ZZone + сохранить mapping |
| `product.updated` | Товар изменён | Push изменения в ZZone |
| `product.deleted` | Товар удалён | Удалить из ZZone + убрать mapping |
| `sale.created` | Продажа через POS | Push обновлённый stock |
| `inventory.movement` | Приход/расход | Push обновлённый stock |

Sync работает **только** для tenant'ов с:
- `businessType = 'AUTO_PARTS'`
- `IntegrationConfig.isActive = true`
- Валидный `token` в config

---

## Webhooks (RAOS → ZZone)

RAOS отправляет POST webhook при следующих событиях:

**URL:** `POST https://api.zzone.uz/api/raos/webhook`
**Header:** `X-ZZone-Api-Key: {ZZONE_WEBHOOK_SECRET}`

| Event | Trigger | Payload |
|-------|---------|---------|
| `order_status_changed` | Статус заказа изменён | `{ orderId, sellerId, status }` |
| `stock_updated` | Продажа или приход/расход | `{ productId, sellerId, stock }` |
| `product_synced` | Товар создан/изменён/удалён | `{ productId, sellerId, action }` |
| `seller_deactivated` | Seller деактивирован | `{ sellerId }` |

**Формат тела запроса:**
```json
{
  "event": "order_status_changed",
  "timestamp": "2026-05-23T12:00:00.000Z",
  "data": { "orderId": "uuid", "sellerId": "uuid", "status": "CONFIRMED" }
}
```

**Retry:** При ошибке — сохраняется в `webhook_logs` таблицу (3 попытки).

**ENV переменные:**
- `ZZONE_WEBHOOK_URL` — URL для webhook (default: `https://api.zzone.uz/api/raos/webhook`)
- `ZZONE_WEBHOOK_SECRET` — API ключ (ZZone предоставляет)

---

## Database Models

### Vehicle (global)
```
id, brand, model, yearFrom, yearTo, bodyType, createdAt
@@unique([brand, model, yearFrom])
```

### ProductVehicleCompatibility
```
id, productId, vehicleId, notes, createdAt
@@unique([productId, vehicleId])
```

### Product (extended)
```
+ zzoneVisible Boolean @default(false) — видимость на ZZone
```

### IntegrationConfig
```
tenantId + provider='ZZONE' (unique)
config: { token: string, productMappings: { raosId: zzoneId } }
isActive: boolean
```

---

## Errors

```json
{
  "success": false,
  "error": { "code": "HTTP_401", "message": "Invalid API key" }
}
```

| Code | Meaning |
|------|---------|
| 401 | Нет или неверный `X-Api-Key` |
| 400 | Validation error (e.g., edit COMPLETED order) |
| 404 | Entity не найден |
| 500 | Внутренняя ошибка RAOS |

---

## Summary

| Group | Endpoints | Description |
|-------|-----------|-------------|
| Products | 5 | CRUD + stock check + `updatedAfter` filter |
| Orders | 6 | CRUD + status + void (stock restored) |
| Sellers | 3 | Read + update + deactivate |
| Stores | 4 | **List** + Read + update + deactivate |
| Vehicles | 7 | CRUD + compatibility |
| Health | 1 | Status check |
| **Total ZZone API** | **26** | |
| Admin (JWT) | 3 | ZZone config management |
| Auto-sync | 5 events | Product lifecycle + stock |
| Webhooks | 4 events | order_status, stock, product, seller |

---

## See Also

- [RAOS x Adetal Collaboration](./RAOS_ADETAL_COLLABORATION.md) — Adetal marketplace integration
- Both integrations use the shared `IntegrationConfig` model (different `provider` values: `ZZONE` / `ADETAL`)
