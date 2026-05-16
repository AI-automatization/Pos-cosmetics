# RAOS x ZZone — Коллаборация

> **Последнее обновление:** 2026-05-16
> **Статус:** Планирование → Реализация

---

## Концепция (одно предложение)

**POS (RAOS) — инструмент продавца. ZZone — витрина для клиентов. POS пушит товары в ZZone, клиенты заказывают через ZZone, POS забирает и обрабатывает заказы.**

---

## Роли систем

| Система | Роль | Аналогия |
|---------|------|----------|
| **RAOS POS** | Продавец управляет бизнесом | Кассир + менеджер + склад |
| **ZZone Backend** | Маркетплейс (MongoDB, Express) | Uzum Market / Wildberries |
| **ZZone Apps** | Клиент ищет и заказывает | Mobile + Web + Telegram |

```
RAOS POS = Продавец (управляет товарами, складом, ценами)
ZZone    = Маркетплейс (показывает клиентам, принимает заказы)
```

---

## Архитектура

```
┌──────────────────────────────────────────────────────────────────────┐
│                         RAOS POS (Tauri + SQLite)                     │
│                                                                      │
│  Локальная БД (offline-first):                                       │
│  ├─ pos_sellers    (данные продавца + ZZone token)                   │
│  ├─ pos_stores     (магазин + zzone_store_id)                        │
│  ├─ pos_products   (товары + zzone_product_id + sync_status)         │
│  ├─ pos_orders     (заказы из ZZone)                                 │
│  └─ pos_sync_queue (outbox — очередь для отправки)                   │
│                                                                      │
│  Sync Service:                                                       │
│  ├─ Push: товар создан/изменён → POST/PATCH в ZZone                 │
│  ├─ Pull: периодически GET orders → новые заказы                     │
│  └─ Outbox: нет интернета → копит → отправляет когда есть           │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                          REST API (HTTPS)
                          Bearer JWT (SELLER)
                                 │
┌────────────────────────────────┴─────────────────────────────────────┐
│                      ZZone Backend (Express + MongoDB)                │
│                   zzoneback-production.up.railway.app                 │
│                                                                      │
│  Роли: ADMIN, SELLER, CLIENT                                        │
│                                                                      │
│  Данные:                                                             │
│  ├─ Users     (seller аккаунты, client аккаунты)                    │
│  ├─ Stores    (магазины продавцов)                                   │
│  ├─ Products  (товары — то что видят клиенты)                       │
│  └─ Orders    (заказы клиентов)                                      │
│                                                                      │
│  Обслуживает:                                                        │
│  ├─ ZZone Mobile App (React Native)                                  │
│  ├─ ZZone Web App (Next.js)                                          │
│  └─ ZZone Telegram Bot                                               │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                          REST API (HTTPS)
                                 │
┌────────────────────────────────┴─────────────────────────────────────┐
│                      ZZone Client Apps                                │
│                                                                      │
│  Клиент:                                                             │
│  ├─ Ищет товары (по категории, цене, геолокации)                    │
│  ├─ Смотрит магазины рядом                                           │
│  ├─ Заказывает (Click / Payme / Наличные)                           │
│  └─ Отслеживает статус заказа                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Потоки данных (детально)

### Поток 1: Первичная настройка (один раз)

```
Шаг 1: Admin ZZone создаёт seller + store
────────────────────────────────────────────
ZZone Admin Panel → POST /api/admin/stores
{
  "seller": {
    "name": "Abdullayev Jasur",
    "phone": "+998901234567",
    "email": "jasur@gmail.com",
    "password": "parol123"
  },
  "store": {
    "name": "Avto Zapchast Pro",
    "description": "Toyota va Nexia uchun original zapchastlar",
    "contacts": {
      "phone": "+998901234567",
      "telegram": "avtozapchast_pro",
      "instagram": "avtozapchast_pro",
      "whatsapp": "+998901234567"
    },
    "location": {
      "lat": 41.2995,
      "lng": 69.2401,
      "address": "Toshkent, Chilonzor, 9-kvartal"
    }
  }
}
→ Результат: seller_id + store_id созданы в MongoDB

Шаг 2: POS логинится как этот seller
──────────────────────────────────────
POS → POST /api/auth/login
{
  "phone": "+998901234567",
  "password": "parol123"
}
→ Результат: JWT token
→ POS сохраняет: token + zzone_user_id + zzone_store_id в SQLite
```

---

### Поток 2: Добавление товара (POS → ZZone)

```
Шаг 1: Продавец добавляет товар в POS
──────────────────────────────────────
POS UI → Сохраняет в SQLite (pos_products):
{
  id: "local-uuid-001",
  name: "Yog' filtri Toyota Camry",
  price: 45000,
  category: "Filtrlar",
  description: "Original, Toyota Camry 2015-2020 uchun",
  stock: 10,
  barcode: "4607123456789",
  sync_status: "pending",
  zzone_product_id: null
}

Шаг 2: Sync Service отправляет в ZZone
───────────────────────────────────────
POS → POST /api/products/my
Authorization: Bearer <seller_token>
{
  "name": "Yog' filtri Toyota Camry",
  "price": 45000,
  "category": "Filtrlar",
  "description": "Original, Toyota Camry 2015-2020 uchun",
  "stock": 10
}
→ Результат: { _id: "664..." }

Шаг 3: POS обновляет локальную запись
─────────────────────────────────────
pos_products:
{
  ...
  sync_status: "synced",
  zzone_product_id: "664..."
}
```

---

### Поток 3: Оффлайн продажа (stock уменьшается)

```
Шаг 1: Кассир продал 2 шт. через POS
──────────────────────────────────────
POS: stock 10 → 8
SQLite: UPDATE pos_products SET stock = 8, sync_status = 'pending'

Шаг 2: Sync Service пушит в ZZone
──────────────────────────────────
POS → PATCH /api/products/:zzone_product_id
Authorization: Bearer <seller_token>
{
  "stock": 8
}
→ ZZone обновляет остаток → клиент видит актуальный stock
```

---

### Поток 4: Клиент заказывает (ZZone → POS)

```
Шаг 1: Клиент на ZZone App находит товар и заказывает
─────────────────────────────────────────────────────
ZZone App → POST /api/orders
{
  "product_id": "664...",
  "quantity": 2,
  "payment_method": "CLICK",
  "delivery": "PICKUP"
}
→ ZZone: Order создан, status: "PENDING"

Шаг 2: POS периодически проверяет новые заказы
──────────────────────────────────────────────
POS → GET /api/orders/seller
Authorization: Bearer <seller_token>
→ Результат: [{ _id: "ord-001", status: "PENDING", ... }]

Шаг 3: POS сохраняет заказ локально
────────────────────────────────────
SQLite: INSERT INTO pos_orders {
  zzone_order_id: "ord-001",
  product_id: "local-uuid-001",
  quantity: 2,
  total: 90000,
  status: "PENDING",
  client_phone: "+998991234567"
}

Шаг 4: Продавец подтверждает заказ
──────────────────────────────────
POS UI → "Подтвердить"
POS → PATCH /api/orders/ord-001/status
{
  "status": "CONFIRMED"
}
→ Клиент получает пуш: "Ваш заказ подтверждён"

Шаг 5: POS обновляет stock
───────────────────────────
POS: stock 8 → 6 (продал 2)
POS → PATCH /api/products/:id { "stock": 6 }
```

---

### Поток 5: Возврат

```
Клиент → ZZone App → "Вернуть заказ"
ZZone: order status → "RETURN_REQUESTED"

POS (при следующем pull):
→ Видит order со статусом RETURN_REQUESTED
→ Продавец решает: Одобрить / Отклонить

Одобрить:
  POS → PATCH /api/orders/:id/status { "status": "RETURNED" }
  POS: stock += quantity
  POS → PATCH /api/products/:id { "stock": +2 }

Отклонить:
  POS → PATCH /api/orders/:id/status { "status": "RETURN_REJECTED" }
```

---

## ZZone API — Используемые POS'ом endpoints

### Существующие (работают сейчас)

| # | Method | Endpoint | POS использует для |
|---|--------|----------|-------------------|
| 1 | POST | `/api/auth/login` | Авторизация seller |
| 2 | GET | `/api/auth/me` | Проверка токена |
| 3 | GET | `/api/stores/my` | Получить данные магазина |
| 4 | PUT | `/api/stores/my/location` | Обновить геолокацию |
| 5 | POST | `/api/products/my` | Создать товар |
| 6 | GET | `/api/products/my` | Мои товары (сверка) |

### Проверены и РАБОТАЮТ (2026-05-16)

| # | Method | Endpoint | Назначение | Статус |
|---|--------|----------|-----------|--------|
| 7 | PATCH | `/api/products/:id` | Обновить товар (stock, price, name) | ✅ |
| 8 | DELETE | `/api/products/:id` | Удалить/скрыть товар | ✅ |
| 9 | GET | `/api/orders/seller` | Заказы продавца (новые, все) | ✅ |
| 10 | PATCH | `/api/orders/:id/status` | Изменить статус заказа | ✅ |

**Все endpoint'ы уже существуют и работают. Добавлять в ZZone ничего не нужно.**

---

## POS — Локальная БД (SQLite)

### pos_sellers
```json
{
  "id": "local-uuid",
  "name": "Abdullayev Jasur",
  "phone": "+998901234567",
  "zzone_user_id": "6649a1b2c3d4e5f6a7b8c9d0",
  "zzone_token": "eyJhbGci...",
  "zzone_token_expires_at": "2026-06-01T00:00:00Z",
  "created_at": "2026-05-16T10:00:00Z"
}
```

### pos_stores
```json
{
  "id": "local-uuid",
  "seller_id": "local-uuid",
  "name": "Avto Zapchast Pro",
  "phone": "+998901234567",
  "telegram": "avtozapchast_pro",
  "lat": 41.2995,
  "lng": 69.2401,
  "address": "Toshkent, Chilonzor, 9-kvartal",
  "zzone_store_id": "6649a1b2c3d4e5f6a7b8c9d1",
  "created_at": "2026-05-16T10:00:00Z"
}
```

### pos_products
```json
{
  "id": "local-uuid",
  "store_id": "local-uuid",
  "name": "Yog' filtri Toyota Camry",
  "price": 45000,
  "category": "Filtrlar",
  "description": "Original, 2015-2020",
  "stock": 10,
  "barcode": "4607123456789",
  "images": [],
  "zzone_product_id": "6649a1b2c3d4e5f6a7b8c9d2",
  "sync_status": "synced",
  "last_synced_at": "2026-05-16T10:00:00Z",
  "created_at": "2026-05-16T10:00:00Z"
}
```

**sync_status:** `pending` | `syncing` | `synced` | `failed`

### pos_orders
```json
{
  "id": "local-uuid",
  "zzone_order_id": "6649a1b2c3d4e5f6a7b8c9d3",
  "zzone_order_number": "ZZ-0042",
  "product_id": "local-uuid (pos_products.id)",
  "product_name": "Yog' filtri Toyota Camry",
  "quantity": 2,
  "unit_price": 45000,
  "total": 90000,
  "status": "PENDING",
  "payment_method": "CLICK",
  "client_name": "Aziz",
  "client_phone": "+998991234567",
  "delivery_type": "PICKUP",
  "fetched_at": "2026-05-16T10:30:00Z",
  "confirmed_at": null
}
```

**Order statuses:** `PENDING` → `CONFIRMED` → `READY` → `COMPLETED` | `CANCELLED` | `RETURN_REQUESTED` → `RETURNED`

### pos_sync_queue (Outbox)
```json
{
  "id": "local-uuid",
  "action": "CREATE_PRODUCT",
  "payload": { "name": "...", "price": 45000, "stock": 10 },
  "target_url": "/api/products/my",
  "method": "POST",
  "status": "pending",
  "attempts": 0,
  "max_attempts": 5,
  "last_error": null,
  "created_at": "2026-05-16T10:00:00Z"
}
```

**Outbox actions:** `CREATE_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`, `UPDATE_ORDER_STATUS`

---

## Sync Service — Логика

### Push (POS → ZZone)

```
Каждые 30 секунд (или при событии):
1. SELECT * FROM pos_sync_queue WHERE status = 'pending' ORDER BY created_at
2. Для каждого:
   a. status = 'syncing'
   b. Отправить HTTP запрос в ZZone
   c. Если 200/201 → status = 'done', обновить zzone_*_id
   d. Если 4xx → status = 'failed', сохранить ошибку
   e. Если 5xx/timeout → attempts++, если < max → 'pending' (retry)
   f. Если attempts >= max → status = 'failed', уведомить продавца
```

### Pull (ZZone → POS)

```
Каждые 60 секунд:
1. GET /api/orders/seller?status=PENDING&since=<last_fetch_time>
2. Для каждого нового заказа:
   a. Проверить: уже есть в pos_orders? (по zzone_order_id)
   b. Если нет → INSERT в pos_orders
   c. Показать уведомление продавцу: "Новый заказ!"
3. Обновить last_fetch_time
```

### Offline режим

```
Нет интернета:
1. Все операции идут в pos_sync_queue со status = 'pending'
2. Продавец работает нормально (продажи, склад)
3. Индикатор: "Оффлайн — 5 операций ждут синхронизации"

Интернет появился:
1. Sync Service автоматически начинает отправку
2. FIFO порядок (сначала старые)
3. Индикатор: "Синхронизация... 3/5"
4. Всё отправлено: "Онлайн ✓"
```

---

## Что НЕ нужно (убрано из старого плана)

| Было в старом плане | Почему убрано |
|--------------------|--------------|
| Vehicle/Compatibility модуль в RAOS | ZZone сам решает как категоризировать |
| Webhook сервис (RAOS→ZZone) | POS напрямую дёргает ZZone API |
| Commission модуль | Это внутренняя логика ZZone |
| 31 новый endpoint в RAOS Backend | Не нужны — используем существующие ZZone endpoints |
| ZZone→RAOS incoming API | POS сам пуллит данные |
| RAOS Backend как посредник | POS работает с ZZone напрямую |

---

## Этапы реализации

### Этап 1: ZZone Backend — добавить недостающие endpoints
**Кто:** ZZone разработчик
**Что:**
- [ ] PATCH `/api/products/:id` — обновление товара (stock, price, name, description)
- [ ] DELETE `/api/products/:id` — удаление товара
- [ ] GET `/api/orders/seller` — список заказов продавца (фильтр: status, since)
- [ ] GET `/api/orders/seller/:id` — детали заказа
- [ ] PATCH `/api/orders/:id/status` — смена статуса

### Этап 2: RAOS POS — SQLite схема
**Кто:** Ibrat
**Что:**
- [ ] Миграция: создать таблицы pos_sellers, pos_stores, pos_products, pos_orders, pos_sync_queue
- [ ] Модель: ZZone credentials хранение (token, refresh)

### Этап 3: RAOS POS — Sync Service
**Кто:** Ibrat
**Что:**
- [ ] ZZoneApiClient — HTTP клиент (fetch + retry + auth header)
- [ ] SyncPushService — outbox processor (30 сек interval)
- [ ] SyncPullService — order fetcher (60 сек interval)
- [ ] OfflineDetector — индикатор статуса сети
- [ ] TokenRefreshService — авто-обновление JWT если истёк

### Этап 4: RAOS POS — UI
**Кто:** Ibrat
**Что:**
- [ ] Настройки → "ZZone интеграция" (вкл/выкл, логин, статус)
- [ ] Товары → иконка синхронизации (synced/pending/failed)
- [ ] Заказы → вкладка "ZZone заказы" (новые, в обработке, выполненные)
- [ ] Статусбар → индикатор онлайн/оффлайн + очередь

### Этап 5: Тестирование
**Что:**
- [ ] Проверить все ZZone endpoints (curl)
- [ ] Тест: создать товар → появился на ZZone
- [ ] Тест: продать оффлайн → stock обновился на ZZone
- [ ] Тест: клиент заказал → POS получил заказ
- [ ] Тест: 5 минут без интернета → всё синхронизировалось после

---

## ZZone MongoDB — Дополнения к моделям

Для поддержки POS интеграции, в ZZone моделях нужны поля:

### User (seller)
```javascript
posId: { type: String, default: null, index: true, sparse: true }
// ID из POS системы — для обратной связи
```

### Store
```javascript
posId: { type: String, default: null, index: true, sparse: true },
posSource: { type: Boolean, default: false }
// posSource = true → этот магазин управляется через POS
```

### Product
```javascript
posId: { type: String, default: null, index: true, sparse: true },
posSource: { type: Boolean, default: false },
barcode: { type: String, default: null, index: true, sparse: true }
```

### Order
```javascript
sellerNotifiedAt: { type: Date, default: null }
// Когда POS забрал этот заказ (для аналитики)
```

---

## Безопасность

| Аспект | Решение |
|--------|---------|
| Авторизация POS→ZZone | JWT token (seller login), refresh при истечении |
| Хранение token | SQLite (зашифрованная таблица) |
| Rate limiting | ZZone: 100 req/min per seller |
| Idempotency | posId в product/order — повторная отправка не создаёт дубль |
| Data validation | POS валидирует перед отправкой (zod schema) |

---

## Ограничения и риски

| Риск | Митигация |
|------|-----------|
| ZZone Backend упал | Outbox копит, отправит когда встанет |
| Токен истёк | Auto-refresh, если не получается → просить переподключение |
| Конфликт stock (POS продал + клиент ZZone одновременно) | ZZone проверяет stock > 0 при заказе, если нет → отклоняет |
| Дубли товаров | posId поле + UPSERT по posId |
| Большой offline-период | Лимит очереди 1000 записей, предупреждение продавцу |

---

## FAQ

**Q: Зачем POS если можно через ZZone App управлять?**
A: POS = полноценная ERP (касса, смены, отчёты, чеки, оффлайн). ZZone App — только витрина.

**Q: Кто "source of truth"?**
A: Для товаров → POS (он управляет складом). Для заказов → ZZone (клиент заказывает там).

**Q: Можно без POS работать?**
A: Да. Seller может добавлять товары через ZZone Seller App. POS — опциональное усиление.

**Q: Комиссия?**
A: Это внутри ZZone. POS не участвует в расчёте комиссии. Seller видит в ZZone App.
