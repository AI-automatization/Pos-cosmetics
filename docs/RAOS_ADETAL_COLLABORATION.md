# RAOS x Adetal — Collaboration API

> **Adetal API:** `https://api.adetal.uz`
> **Auth:** `Authorization: Bearer <accessToken>`
> **Updated:** 2026-06-10

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     Adetal Backend (Express + MongoDB)             │
│                        api.adetal.uz                               │
│                                                                   │
│  RAOS (SELLER sifatida):                                          │
│  ├─ POST /api/auth/login         → Token olish                   │
│  ├─ POST /api/stores             → Do'kon yaratish               │
│  ├─ POST /api/products           → Mahsulot yaratish (multipart) │
│  ├─ GET  /api/orders/seller      → Zakazlarni olish              │
│  └─ PATCH /api/orders/:id/status → Zakaz statusini yangilash     │
│                                                                   │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                             REST API (HTTPS)
                             Bearer Token Auth
                                    │
┌───────────────────────────────────┴───────────────────────────────┐
│                     RAOS Backend (NestJS + PostgreSQL)             │
│                          api.raos.uz                               │
│                                                                   │
│  Outbound (RAOS → Adetal):                                        │
│  ├─ AdetalOutboundService  — HTTP client (all 12 API sections)   │
│  ├─ AdetalSyncListener     — auto-push on domain events          │
│  └─ AdetalOrderPollerService — cron poll orders (every 2 min)    │
│                                                                   │
│  Inbound (Adetal → RAOS):                                         │
│  └─ AdetalInboundService   — convert Adetal orders to RAOS       │
│                                                                   │
│  Auto-sync events:                                                │
│  ├─ product.created  → create product on Adetal                  │
│  ├─ product.updated  → update product on Adetal                  │
│  ├─ product.deleted  → delete product on Adetal                  │
│  ├─ sale.created     → update stock on Adetal                    │
│  └─ inventory.movement → update stock on Adetal                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## Authentication

Adetal использует Bearer token аутентификацию:

- **Access Token:** 1 час TTL
- **Refresh Token:** 30 дней TTL
- Токены хранятся в `IntegrationConfig.config` JSON (per-tenant)
- Автоматический refresh за 5 минут до истечения

### Настройка через Super Admin

```
PATCH /admin/tenants/:id/adetal-config
Body: { "phone": "+998901234567", "password": "...", "isActive": true }
```

При получении phone + password, RAOS автоматически логинится в Adetal и сохраняет токены.

---

## AUTO_PARTS Tenant Flow

```
1. Super Admin создаёт tenant с типом "Авто запчасти"
   → Автоматически создаётся IntegrationConfig (provider: ADETAL)
   → isActive: false (требуется ручная активация)

2. Super Admin настраивает Adetal аккаунт
   → PATCH /admin/tenants/:id/adetal-config { phone, password, isActive: true }
   → RAOS логинится в Adetal, сохраняет tokens

3. Owner создаёт товар в RAOS → event product.created
   → AdetalSyncListener создаёт товар на Adetal (multipart)
   → Mapping сохраняется (raosId ↔ adetalId)
   → Товар на Adetal в статусе PENDING (модерация)

4. Клиент на Adetal делает заказ
   → AdetalOrderPollerService (каждые 2 мин) находит новый заказ
   → AdetalInboundService создаёт заказ в RAOS (origin: ADETAL)
   → Stock автоматически вычитается

5. Seller обрабатывает заказ через RAOS
   → Обновляет статус → sync обратно в Adetal
```

---

## Adetal API Endpoints (используемые RAOS)

### Auth (3)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Логин (phone + password → tokens) |
| POST | `/api/auth/refresh` | Обновить access token |
| GET | `/api/auth/me` | Профиль текущего пользователя |

### Store (10)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/stores` | Создать до'кон |
| GET | `/api/stores/my` | Получить свой до'кон |
| PATCH | `/api/stores/my` | Обновить (description, contacts) |
| PUT | `/api/stores/my/location` | Обновить геолокацию |
| PATCH | `/api/stores/my/logo` | Загрузить логотип (multipart) |
| POST | `/api/stores/my/images` | Добавить gallery изображения |
| DELETE | `/api/stores/my/images/:index` | Удалить gallery изображение |
| PATCH | `/api/stores/my/card` | Сохранить номер карты |
| GET | `/api/stores/plans` | Список обуна планов |
| POST | `/api/stores/subscription` | Активировать обуна план |
| GET | `/api/stores/my/analytics` | Аналитика продавца |

### Products (5)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/products` | Создать (multipart с images) |
| GET | `/api/products/my` | Свои товары (все статусы) |
| PATCH | `/api/products/:id` | Обновить (→ PENDING модерация) |
| DELETE | `/api/products/:id` | Удалить товар |
| GET | `/api/products/:id` | Получить по ID |

### Orders (3)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders/seller` | Входящие заказы (фильтр по status) |
| PATCH | `/api/orders/:id/status` | Обновить статус |
| PATCH | `/api/orders/:id/review-payment` | Подтвердить/отклонить оплату |

### Notifications (2)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | Список уведомлений |
| PATCH | `/api/notifications/read-all` | Отметить все как прочитанные |

### Reviews (1)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reviews/seller` | Отзывы на свои товары |

---

## Order Status Mapping

| Adetal Status | RAOS OrderStatus |
|---------------|-----------------|
| PENDING | PENDING |
| PAYMENT_REVIEW | PENDING |
| CONFIRMED | CONFIRMED |
| SHIPPED | CONFIRMED |
| DELIVERED | COMPLETED |
| CANCELLED | VOIDED |

---

## Auto-Sync Events

| Event | Trigger | Action |
|-------|---------|--------|
| `product.created` | Товар создан в RAOS | Создать на Adetal (multipart) + сохранить mapping |
| `product.updated` | Товар изменён | Обновить на Adetal (name, price, description) |
| `product.deleted` | Товар удалён | Удалить с Adetal + убрать mapping |
| `sale.created` | Продажа через POS | Обновить stock на Adetal |
| `inventory.movement` | Приход/расход | Обновить stock на Adetal |

Sync работает **только** для tenant'ов с:
- `IntegrationConfig.provider = 'ADETAL'`
- `IntegrationConfig.isActive = true`
- Валидный `accessToken` в config

---

## Order Polling (Cron)

Adetal не поддерживает webhooks, поэтому RAOS использует polling:

- **Интервал:** каждые 2 минуты (`*/2 * * * *`)
- **Эндпоинт:** `GET /api/orders/seller?status=PENDING`
- **Идемпотентность:** проверка по `origin='ADETAL'` + notes prefix
- **lastPolledAt:** сохраняется в IntegrationConfig.config

---

## Database

### IntegrationConfig (provider='ADETAL')

```json
{
  "phone": "+998901234567",
  "accessToken": "eyJ...",
  "refreshToken": "abc...",
  "tokenExpiresAt": "2026-06-10T13:00:00.000Z",
  "storeId": "mongoId",
  "productMappings": { "raos-uuid": "adetal-mongoId" },
  "reverseProductMappings": { "adetal-mongoId": "raos-uuid" },
  "lastPolledAt": "2026-06-10T12:00:00.000Z"
}
```

### Product (extended)

```
+ adetalVisible Boolean @default(false) — видимость на Adetal
```

---

## Super Admin Endpoints (3)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/tenants/:id/adetal-config` | Текущая конфигурация |
| PATCH | `/admin/tenants/:id/adetal-config` | Обновить (phone, password, isActive) |
| POST | `/admin/tenants/:id/adetal-sync` | Триггер bulk sync |

---

## Ключевые отличия от ZZone

| | ZZone | Adetal |
|---|---|---|
| Auth | X-Api-Key (static) | Bearer token (1h + refresh 30d) |
| Direction | Bidirectional (inbound API + outbound) | Outbound only + polling |
| Webhooks | RAOS → ZZone (4 events) | Нет |
| Product flow | Мгновенная публикация | PENDING → APPROVED модерация |
| Images | URL reference | multipart/form-data upload |
| Orders | ZZone вызывает POST /zzone/orders | RAOS polling GET /api/orders/seller |

---

## ENV Variables

```bash
ADETAL_API_URL=https://api.adetal.uz      # Adetal API base URL
ADETAL_POLL_ENABLED=true                   # Enable order polling
```

---

## Module Structure

```
apps/api/src/integrations/adetal/
├── adetal.module.ts              — NestJS module
├── adetal-outbound.service.ts    — HTTP client (RAOS → Adetal)
├── adetal-inbound.service.ts     — Order processing (Adetal → RAOS)
├── adetal-sync.listener.ts       — Domain event → auto-push
├── adetal-order-poller.service.ts — Cron order polling
├── adetal.constants.ts           — Status maps, constants
└── dto/
    └── adetal.dto.ts             — DTOs + interfaces
```

---

## See Also

- [RAOS x ZZone Collaboration](./RAOS_ZZONE_COLLABORATION.md) — ZZone marketplace integration
- Both integrations share the `IntegrationConfig` model (different `provider` values)
- Vehicle compatibility (`Vehicle` + `ProductVehicleCompatibility`) is shared

---

_RAOS_ADETAL_COLLABORATION.md | v1.0 | 2026-06-10_
