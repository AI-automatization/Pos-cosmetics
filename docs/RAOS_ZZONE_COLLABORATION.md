# RAOS x Zzone — Коллаборация (Два отдельных бэкенда)

## Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAOS BACKEND                              │
│                  NestJS + PostgreSQL + Redis                      │
│                                                                  │
│  Super Admin                                                     │
│  ├─ Создаёт tenant "Auto Olcha"                                 │
│  ├─ Тип магазина: Авто запчасти                                  │
│  └─ Создаёт owner аккаунт                                       │
│                                                                  │
│  Owner Panel (RAOS web)                                          │
│  ├─ Добавляет товар + vehicle compatibility                      │
│  ├─ Ставит ✓ "Показать на Zzone"                                │
│  ├─ Видит заказы из Zzone (origin: 'zzone')                     │
│  └─ Управляет складом, ценами                                    │
│                                                                  │
│  POS (Кассир)                                                    │
│  ├─ Оффлайн продажи                                             │
│  └─ Остаток уменьшается → триггерит push в Zzone                │
│                                                                  │
│  Webhook Service                                                 │
│  └─ При create/update/delete товара → POST в Zzone API           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    REST API (push/pull)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                       ZZONE BACKEND                              │
│                 Express + MongoDB (существующий)                  │
│                 zzoneback-production.up.railway.app               │
│                                                                  │
│  Получает товары от RAOS                                         │
│  ├─ Сохраняет в MongoDB (кэш/зеркало)                           │
│  ├─ Индексирует для поиска (vehicle + category + geo)            │
│  └─ Обновляет stock в реальном времени                           │
│                                                                  │
│  Обслуживает клиентов                                            │
│  ├─ Mobile App (React Native)                                    │
│  ├─ Web App (Next.js)                                            │
│  └─ Telegram Bot                                                 │
│                                                                  │
│  Отправляет заказы в RAOS                                        │
│  └─ Клиент заказал → POST /raos-api/v1/orders → RAOS            │
└──────────────────────────────────────────────────────────────────┘
```

## Компоненты

| Компонент | Стек | Где | Роль |
|-----------|------|-----|------|
| RAOS Backend | NestJS + PostgreSQL | Railway | Source of truth: товары, склад, заказы |
| RAOS Web | Next.js | Railway/Vercel | Super Admin, Owner Panel, POS, Warehouse |
| Zzone Backend | Express + MongoDB | Railway | Зеркало товаров, поиск по авто, корзина |
| Zzone Web | Next.js | Vercel | Витрина для клиентов (web) |
| Zzone Mobile | React Native | App Store/Play | Витрина для клиентов (mobile) |
| Zzone Bot | node-telegram | Railway | Уведомления seller'ам |

```
RAOS = мозг (данные, логика, деньги)
Zzone = витрина (поиск, UX, клиенты)
```

---

## Полный поток — шаг за шагом

### Этап 1: Создание магазина

```
Super Admin (RAOS)
     │
     ├─ POST /admin/tenants/create
     │   { name: "Auto Olcha", type: "auto_parts", owner: {...} }
     │
     ├─ Tenant создан в PostgreSQL
     │   → type: "auto_parts" — UI адаптируется
     │   → Категории: brake_pad, oil_filter, spark_plug...
     │   → Vehicle compatibility модуль включён
     │
     └─ RAOS автоматически → POST /zzone-api/v1/stores
         { raos_tenant_id, name, location, contacts }
         → Zzone создаёт Store в MongoDB
```

### Этап 2: Добавление товара

```
Owner (RAOS Owner Panel)
     │
     ├─ Создаёт товар:
     │   "Тормозная колодка Bosch, 350,000 UZS"
     │   + Совместимость: Audi A6 2015-2023, Audi A7 2017-2023
     │   + ✓ Показать на Zzone
     │
     ├─ POST /catalog/products → RAOS PostgreSQL
     │
     └─ Webhook (авто):
         POST /zzone-api/v1/products
         {
           sku, shop_id, name, price: 350000, stock: 12,
           images: [...],
           compatibility: [
             { vehicle: "AUDI-A6-MK4-2015", confidence: 1.0 },
             { vehicle: "AUDI-A7-MK2-2017", confidence: 1.0 }
           ]
         }
         → Zzone: MongoDB + индекс для поиска
```

### Этап 3: Оффлайн продажа через POS

```
Кассир (RAOS POS)
     │
     ├─ Продал 2 шт. → stock: 12 → 10
     │
     └─ Webhook (авто):
         PATCH /zzone-api/v1/products/:sku { stock: 10 }
         → Zzone обновляет остаток мгновенно
```

### Этап 4: Клиент ищет на Zzone

```
Клиент (Zzone Mobile)
     │
     ├─ Выбирает: "Audi A6 2018"
     │
     ├─ GET /zzone-api/v1/products/search
     │   ?vehicle=AUDI-A6-MK4-2015&category=brake_pad
     │
     ├─ Zzone: MongoDB поиск (< 100ms)
     │   → 5 товаров из 3 магазинов
     │   → Сортировка: совместимость + расстояние + цена
     │
     └─ Перед заказом — проверка остатка:
         Zzone → GET /raos-api/v1/stock/:sku
         → { stock: 10, available: 10 }
```

### Этап 5: Клиент заказывает

```
Клиент (Zzone)
     │
     ├─ "Заказать" → Click / Payme / Наличные
     │
     ├─ Zzone → POST /raos-api/v1/orders
     │   {
     │     zzone_order_id: "ZZN-2026-001",
     │     shop_id, product_sku, qty: 1,
     │     customer: { phone, name },
     │     delivery: { type: "pickup" },
     │     payment: { method: "click", status: "paid" },
     │     commission_rate: 0.07
     │   }
     │
     ├─ RAOS:
     │   ├─ order создан (origin: 'zzone')
     │   ├─ stock: 10 → 9
     │   ├─ commission: 24,500 UZS
     │   └─ Telegram уведомление owner'у
     │
     └─ RAOS → Zzone: { status: "confirmed" }
         → Клиент: "Заказ подтверждён"
```

### Этап 6: Owner обрабатывает

```
Owner (RAOS Owner Panel)
     │
     ├─ Видит: "Zzone #ZZN-2026-001"
     │   Колодка Bosch × 1, Азиз, Click ✓, комиссия 24,500
     │
     ├─ "Готово к выдаче"
     │
     └─ RAOS → Zzone: { status: "ready" }
         → Клиент: пуш "Заберите заказ"
```

### Этап 7: Возврат

```
Клиент (Zzone)
     │
     ├─ Zzone → POST /raos-api/v1/orders/:id/return
     │   { reason: "Не подходит" }
     │
     ├─ Owner: 24ч на решение
     │   ├─ Одобрил → stock +1, refund
     │   └─ Отказал → причина клиенту
     │
     └─ RAOS → Zzone: статус возврата
```

---

## API Контракт

### A. RAOS → Zzone (push)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 1 | POST | `/zzone-api/v1/stores` | Новый магазин |
| 2 | POST | `/zzone-api/v1/products` | Новый товар |
| 3 | PATCH | `/zzone-api/v1/products/:sku` | Обновление (цена, остаток) |
| 4 | DELETE | `/zzone-api/v1/products/:sku` | Архивирование |
| 5 | POST | `/zzone-api/v1/orders/:id/status` | Статус заказа |

### B. Zzone → RAOS (pull/create)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 6 | GET | `/raos-api/v1/stock/:sku` | Проверка остатка |
| 7 | POST | `/raos-api/v1/orders` | Создать заказ |
| 8 | POST | `/raos-api/v1/orders/:id/return` | Запрос возврата |

### C. Zzone внутренние (Mobile/Web → Zzone)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 9 | GET | `/zzone-api/v1/products/search` | Поиск по авто + текст + гео |
| 10 | GET | `/zzone-api/v1/vehicles` | Справочник авто |
| 11 | GET | `/zzone-api/v1/vehicles/brands` | Бренды авто |
| 12 | GET | `/zzone-api/v1/vehicles/:id/products` | Товары для авто |
| 13 | POST | `/zzone-api/v1/cart` | Корзина |
| 14 | GET | `/zzone-api/v1/cart` | Просмотр корзины |
| 15 | POST | `/zzone-api/v1/orders` | Оформить заказ |
| 16 | GET | `/zzone-api/v1/orders` | Мои заказы |
| 17 | GET | `/zzone-api/v1/orders/:id` | Детали + трекинг |
| 18 | POST | `/zzone-api/v1/orders/:id/return` | Возврат |
| 19 | POST | `/zzone-api/v1/reviews` | Отзыв + рейтинг |

### D. Новое в RAOS (Vehicle модуль)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 20 | GET | `/catalog/vehicles` | Список авто |
| 21 | GET | `/catalog/vehicles/:id` | Детали авто |
| 22 | POST | `/catalog/vehicles` | Добавить авто (ADMIN) |
| 23 | POST | `/catalog/vehicles/bulk` | Массовый сид 500 моделей |
| 24 | GET | `/catalog/products/:id/compatibility` | Совместимые авто |
| 25 | POST | `/catalog/products/:id/compatibility` | Добавить совместимость |
| 26 | DELETE | `/catalog/products/:id/compatibility/:vId` | Удалить |
| 27 | GET | `/catalog/vehicles/:id/products` | Товары для авто |
| 28 | POST | `/catalog/products/bulk-import` | CSV/1C импорт |

### E. Комиссия

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 29 | GET | `/zzone-api/v1/commission/report` | Ежемесячный отчёт |
| 30 | GET | `/zzone-api/v1/commission/shop/:id` | По магазину |
| 31 | POST | `/zzone-api/v1/commission/withdraw` | Вывод (Click/Payme) |

---

## Zzone — текущие эндпоинты (25 шт., уже на Railway)

**URL:** `zzoneback-production.up.railway.app`
**Стек:** Express + MongoDB + JWT + Swagger (`/api-docs`)
**Роли:** ADMIN, SELLER, CLIENT

### Auth (3)

| Метод | Эндпоинт | Доступ | Назначение |
|-------|----------|--------|------------|
| POST | `/api/auth/register` | PUBLIC | Регистрация (SELLER/CLIENT) |
| POST | `/api/auth/login` | PUBLIC | Вход → JWT |
| GET | `/api/auth/me` | AUTH | Текущий пользователь |

### Stores (6)

| Метод | Эндпоинт | Доступ | Назначение |
|-------|----------|--------|------------|
| GET | `/api/stores` | PUBLIC | Все активные магазины |
| GET | `/api/stores/plans` | PUBLIC | Тарифы подписки |
| GET | `/api/stores/{id}` | PUBLIC | Инфо магазина |
| GET | `/api/stores/my` | SELLER | Мой магазин |
| PUT | `/api/stores/my/location` | SELLER | Обновить геолокацию |
| POST | `/api/stores/subscription` | SELLER | Купить подписку |

### Products (4)

| Метод | Эндпоинт | Доступ | Назначение |
|-------|----------|--------|------------|
| GET | `/api/products` | PUBLIC | Каталог (фильтры, пагинация) |
| GET | `/api/products/{id}` | PUBLIC | Детали товара |
| GET | `/api/products/my` | SELLER | Мои товары |
| POST | `/api/products/my` | SELLER | Добавить товар |

### Admin (11)

| Метод | Эндпоинт | Доступ | Назначение |
|-------|----------|--------|------------|
| GET | `/api/admin/stats` | ADMIN | Статистика |
| GET | `/api/admin/users` | ADMIN | Пользователи |
| PATCH | `/api/admin/users/{id}/balance` | ADMIN | Изменить баланс |
| PATCH | `/api/admin/users/{id}/block` | ADMIN | Блокировка |
| GET | `/api/admin/stores` | ADMIN | Все магазины |
| POST | `/api/admin/stores` | ADMIN | Создать продавца + магазин |
| GET | `/api/admin/products` | ADMIN | Все товары |
| GET | `/api/admin/products/pending` | ADMIN | На модерации |
| PATCH | `/api/admin/products/{id}/approve` | ADMIN | Одобрить |
| PATCH | `/api/admin/products/{id}/reject` | ADMIN | Отклонить |
| DELETE | `/api/admin/products/{id}` | ADMIN | Удалить |

### Health (1)

| Метод | Эндпоинт | Назначение |
|-------|----------|------------|
| GET | `/health` | Статус сервера |

---

## RAOS — текущие эндпоинты (326 шт.)

### Auth & Identity (29)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 1 | POST | `/auth/register` | Регистрация tenant + owner |
| 2 | POST | `/auth/login` | Вход (email+password+slug) |
| 3 | POST | `/auth/refresh` | Обновить access token |
| 4 | POST | `/auth/logout` | Выход |
| 5 | GET | `/auth/me` | Текущий пользователь |
| 6 | POST | `/auth/pin/set` | Установить PIN |
| 7 | POST | `/auth/pin/verify` | Проверить PIN |
| 8 | GET | `/auth/pin/status` | Статус PIN |
| 9 | GET | `/auth/tenant` | Инфо tenant (ИНН, СТИР) |
| 10 | PATCH | `/auth/tenant` | Обновить налоговые данные |
| 11 | GET | `/auth/sessions` | Активные сессии |
| 12 | DELETE | `/auth/sessions/all` | Выйти везде |
| 13 | DELETE | `/auth/sessions/:id` | Завершить сессию |
| 14 | GET | `/auth/sessions/all` | Все сессии tenant (ADMIN) |
| 15 | DELETE | `/auth/sessions/user/:userId` | Выгнать сотрудника |
| 16 | POST | `/auth/api-keys` | Создать API ключ |
| 17 | GET | `/auth/api-keys` | Список ключей |
| 18 | GET | `/auth/api-keys/scopes` | Доступные scopes |
| 19 | DELETE | `/auth/api-keys/:id/revoke` | Отозвать ключ |
| 20 | DELETE | `/auth/api-keys/:id` | Удалить ключ |
| 21 | POST | `/auth/biometric/register` | Регистрация биометрии |
| 22 | POST | `/auth/biometric/verify` | Вход по биометрии |
| 23 | GET | `/users` | Пользователи (paginated) |
| 24 | GET | `/users/:id` | Детали |
| 25 | POST | `/users` | Создать пользователя |
| 26 | PATCH | `/users/:id` | Обновить |
| 27 | DELETE | `/users/:id` | Удалить |
| 28 | POST | `/users/:id/unlock` | Разблокировать |
| 29 | POST | `/users/:id/reset-password` | Сброс пароля |

### Super Admin (46)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 30 | POST | `/admin/auth/login` | Вход Super Admin |
| 31 | POST | `/admin/auth/bootstrap` | Первый admin |
| 32 | POST | `/admin/auth/reset-password` | Сброс пароля |
| 33 | POST | `/admin/auth/create` | Новый Super Admin |
| 34 | GET | `/admin/tenants` | Все tenants |
| 35 | GET | `/admin/tenants/:id` | Детали tenant |
| 36 | PATCH | `/admin/tenants/:id/activate` | Активировать |
| 37 | PATCH | `/admin/tenants/:id/deactivate` | Деактивировать |
| 38 | GET | `/admin/metrics` | Глобальные метрики |
| 39 | GET | `/admin/tenants/:id/sales` | Продажи tenant |
| 40 | GET | `/admin/tenants/:id/health` | Здоровье tenant |
| 41 | GET | `/admin/revenue-series` | График выручки |
| 42 | GET | `/admin/top-tenants` | Топ-5 tenants |
| 43 | GET | `/admin/errors` | Логи ошибок |
| 44 | POST | `/admin/impersonate/:tenantId` | Войти как tenant |
| 45 | POST | `/admin/tenants/provision` | 1-click создание |
| 46 | POST | `/admin/ip-block` | Заблокировать IP |
| 47 | DELETE | `/admin/ip-unblock/:ip` | Разблокировать IP |
| 48 | GET | `/admin/ip-block/:ip/stats` | Статистика IP |
| 49 | GET | `/admin/dlq` | Dead Letter Queue |
| 50 | GET | `/admin/dlq/count` | Кол-во DLQ |
| 51 | POST | `/admin/dlq/:queue/:jobId/retry` | Повторить job |
| 52 | DELETE | `/admin/dlq/:queue/:jobId` | Удалить job |
| 53 | POST | `/admin/tenants/create` | Полное создание tenant |
| 54 | PATCH | `/admin/tenants/:id` | Редактировать tenant |
| 55 | DELETE | `/admin/tenants/:id` | Удалить tenant |
| 56 | GET | `/admin/tenants/:id/users` | Пользователи tenant |
| 57 | POST | `/admin/tenants/:id/owners` | Добавить owner |
| 58 | GET | `/admin/tenants/:id/usage` | Использование vs лимиты |
| 59 | GET | `/admin/tenants/:id/subscription` | Подписка tenant |
| 60 | POST | `/admin/tenants/:id/subscription` | Override подписки |
| 61 | GET | `/admin/tenants/:id/audit-log` | Аудит лог |
| 62 | GET | `/admin/db/tables` | Список таблиц |
| 63 | GET | `/admin/db/tables/:name/schema` | Структура таблицы |
| 64 | GET | `/admin/db/tables/:name/data` | Данные таблицы |
| 65 | GET | `/admin/db/stats` | Статистика БД |
| 66 | GET | `/admin/db/migrations` | История миграций |
| 67 | GET | `/admin/db/tables/:name/export` | CSV экспорт |
| 68 | POST | `/admin/db/tables/:name/rows` | Создать запись |
| 69 | PATCH | `/admin/db/tables/:name/rows/:id` | Обновить запись |
| 70 | PUT | `/admin/db/tables/:name/rows/bulk` | Bulk update |
| 71 | DELETE | `/admin/db/tables/:name/rows/:id` | Удалить запись |
| 72 | DELETE | `/admin/db/tables/:name/rows/bulk` | Bulk delete |
| 73 | POST | `/admin/db/query` | SQL запрос (SUPER_ADMIN) |
| 74 | GET | `/admin/feature-flags` | Feature flags |
| 75 | PATCH | `/admin/feature-flags/:key` | Toggle feature |

### Catalog & Products (40)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 76 | GET | `/catalog/categories` | Категории (дерево) |
| 77 | POST | `/catalog/categories` | Создать категорию |
| 78 | PATCH | `/catalog/categories/:id` | Обновить |
| 79 | DELETE | `/catalog/categories/:id` | Удалить |
| 80 | GET | `/catalog/units` | Единицы измерения |
| 81 | POST | `/catalog/units` | Создать единицу |
| 82 | GET | `/catalog/products` | Список товаров |
| 83 | GET | `/catalog/products/barcode/:code` | Поиск по штрихкоду |
| 84 | GET | `/catalog/products/:id` | Детали товара |
| 85 | POST | `/catalog/products` | Создать товар |
| 86 | PATCH | `/catalog/products/:id` | Обновить |
| 87 | DELETE | `/catalog/products/:id` | Удалить |
| 88 | GET | `/catalog/suppliers` | Поставщики |
| 89 | GET | `/catalog/suppliers/:id` | Детали поставщика |
| 90 | POST | `/catalog/suppliers` | Создать поставщика |
| 91 | PATCH | `/catalog/suppliers/:id` | Обновить |
| 92 | DELETE | `/catalog/suppliers/:id` | Удалить |
| 93 | POST | `/catalog/suppliers/:id/products` | Привязать товар |
| 94 | DELETE | `/catalog/suppliers/:id/products/:pId` | Отвязать |
| 95 | GET | `/catalog/products/:id/components` | Состав бандла |
| 96 | POST | `/catalog/products/:id/components` | Добавить компонент |
| 97 | DELETE | `/catalog/products/:id/components/:cId` | Удалить |
| 98 | GET | `/catalog/products/:id/variants` | Варианты |
| 99 | POST | `/catalog/products/:id/variants` | Создать вариант |
| 100 | PATCH | `/catalog/products/:id/variants/:vId` | Обновить |
| 101 | DELETE | `/catalog/products/:id/variants/:vId` | Удалить |
| 102 | GET | `/catalog/products/:id/prices` | Ценовые уровни |
| 103 | POST | `/catalog/products/:id/prices` | Добавить цену |
| 104 | PATCH | `/catalog/products/:id/prices/:pId` | Обновить |
| 105 | DELETE | `/catalog/products/:id/prices/:pId` | Удалить |
| 106 | GET | `/catalog/products/:id/prices/resolve` | Расчёт цены для POS |
| 107 | GET | `/catalog/products/:id/certificates` | Сертификаты |
| 108 | POST | `/catalog/products/:id/certificates` | Добавить |
| 109 | DELETE | `/catalog/products/:id/certificates/:cId` | Удалить |
| 110 | GET | `/catalog/certificates/expiring` | Истекающие |
| 111 | GET | `/catalog/price-changes` | История изменений цен |
| 112 | GET | `/catalog/products/:id/price-changes` | История цен товара |
| 113 | GET | `/catalog/products/:id/barcode` | Генерация штрихкода PNG |
| 114 | POST | `/catalog/products/import` | Импорт CSV/XLSX |
| 115 | GET | `/catalog/products/export` | Экспорт CSV/XLSX |

### Inventory & Warehouse (34)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 116 | GET | `/inventory/warehouses` | Склады |
| 117 | POST | `/inventory/warehouses` | Создать склад |
| 118 | POST | `/inventory/movements` | Движение товара |
| 119 | POST | `/inventory/stock-in` | Приход партии |
| 120 | POST | `/inventory/stock-out` | Расход партии |
| 121 | GET | `/inventory/movements` | История движений |
| 122 | GET | `/inventory/levels` | Текущие остатки |
| 123 | GET | `/inventory/stock` | Остатки (mobile alias) |
| 124 | GET | `/inventory/stock/low` | Мало на складе (mobile) |
| 125 | GET | `/inventory/low-stock` | Мало на складе |
| 126 | GET | `/inventory/items` | Инвентарь (paginated) |
| 127 | GET | `/inventory/stock-value` | Стоимость склада |
| 128 | POST | `/inventory/restock-request` | Запрос пополнения |
| 129 | GET | `/inventory/out-of-stock` | Отсутствующие товары |
| 130 | GET | `/inventory/expiring` | Истекающий срок (30 дн.) |
| 131 | GET | `/inventory/expired` | Просроченные |
| 132 | POST | `/inventory/testers` | Открыть тестер |
| 133 | GET | `/inventory/testers` | История тестеров |
| 134 | POST | `/inventory/transfers` | Создать трансфер |
| 135 | GET | `/inventory/transfers` | Список трансферов |
| 136 | PATCH | `/inventory/transfers/:id/approve` | Утвердить |
| 137 | PATCH | `/inventory/transfers/:id/ship` | Отправить |
| 138 | PATCH | `/inventory/transfers/:id/receive` | Получить |
| 139 | PATCH | `/inventory/transfers/:id/cancel` | Отменить |
| 140 | POST | `/inventory/write-off` | Списание |
| 141 | POST | `/warehouse/invoices` | Создать накладную |
| 142 | GET | `/warehouse/invoices` | Накладные |
| 143 | GET | `/warehouse/invoices/:id` | Детали накладной |
| 144 | PATCH | `/warehouse/invoices/:id/approve` | Утвердить |
| 145 | PATCH | `/warehouse/invoices/:id/reject` | Отклонить |
| 146 | GET | `/warehouse/dashboard` | Дашборд склада |
| 147 | GET | `/warehouse/movements` | История движений |
| 148 | GET | `/warehouse/movements/today` | Сегодняшние движения |
| 149 | GET | `/warehouse/alerts` | Критические алерты |

### Sales & Orders (17)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 150 | POST | `/sales/shifts/open` | Открыть смену |
| 151 | POST | `/sales/shifts/:id/close` | Закрыть смену |
| 152 | GET | `/sales/shifts/current` | Текущая смена |
| 153 | GET | `/sales/shifts/active` | Активные смены |
| 154 | GET | `/sales/quick-stats` | Быстрая статистика |
| 155 | GET | `/sales/shifts` | История смен |
| 156 | GET | `/sales/shifts/summary` | Сводка смен |
| 157 | GET | `/sales/shifts/:id/available-cash` | Наличка для возврата |
| 158 | GET | `/sales/shifts/:id` | Детали смены |
| 159 | POST | `/sales/orders` | Создать заказ (POS) |
| 160 | GET | `/sales/orders` | Список заказов |
| 161 | GET | `/sales/orders/by-number/:num` | По номеру |
| 162 | GET | `/sales/orders/:id` | Детали заказа |
| 163 | GET | `/sales/orders/:id/receipt` | Данные чека |
| 164 | GET | `/sales/returns` | Возвраты |
| 165 | POST | `/sales/returns` | Создать возврат |
| 166 | PATCH | `/sales/returns/:id/approve` | Утвердить возврат |

### Promotions (6)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 167 | GET | `/promotions` | Акции |
| 168 | GET | `/promotions/:id` | Детали акции |
| 169 | POST | `/promotions` | Создать |
| 170 | PATCH | `/promotions/:id` | Обновить |
| 171 | DELETE | `/promotions/:id` | Удалить |
| 172 | POST | `/promotions/apply` | Рассчитать скидку |

### Payments (11)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 173 | GET | `/payments` | Список платежей |
| 174 | POST | `/payments/intent` | Создать payment intent |
| 175 | POST | `/payments/split` | Сплит-оплата |
| 176 | PATCH | `/payments/:id/confirm` | Подтвердить |
| 177 | PATCH | `/payments/:id/settle` | Settle |
| 178 | PATCH | `/payments/:id/reverse` | Отменить |
| 179 | GET | `/payments/order/:orderId` | Платежи заказа |
| 180 | GET | `/payments/:id` | Детали платежа |
| 181 | POST | `/payments/webhooks/payme` | Payme webhook |
| 182 | POST | `/payments/webhooks/click/prepare` | Click Prepare |
| 183 | POST | `/payments/webhooks/click/complete` | Click Complete |

### Customers & Loyalty (12)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 184 | GET | `/customers` | Клиенты |
| 185 | GET | `/customers/:id` | Детали |
| 186 | GET | `/customers/:id/stats` | Статистика |
| 187 | POST | `/customers` | Создать |
| 188 | PATCH | `/customers/:id` | Обновить |
| 189 | DELETE | `/customers/:id` | Удалить |
| 190 | GET | `/loyalty/config` | Конфиг лояльности |
| 191 | PATCH | `/loyalty/config` | Обновить конфиг |
| 192 | GET | `/loyalty/accounts/:customerId` | Счёт лояльности |
| 193 | POST | `/loyalty/earn` | Начислить баллы |
| 194 | POST | `/loyalty/redeem` | Списать баллы |
| 195 | POST | `/loyalty/adjust` | Корректировка (ADMIN) |

### Nasiya / Debts (10)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 196 | POST | `/nasiya` | Создать долг |
| 197 | GET | `/nasiya` | Список долгов |
| 198 | GET | `/nasiya/overdue` | Просроченные |
| 199 | GET | `/nasiya/:id` | Детали |
| 200 | POST | `/nasiya/:id/pay` | Оплатить долг |
| 201 | GET | `/nasiya/customer/:id/summary` | Сводка клиента |
| 202 | GET | `/debts/summary` | Сводка (mobile) |
| 203 | GET | `/debts/aging-report` | Aging report |
| 204 | GET | `/debts/customers` | Должники |
| 205 | GET | `/debts/:id` | Детали (mobile) |

### Notifications & Alerts (17)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 206 | GET | `/notifications` | Уведомления |
| 207 | GET | `/notifications/unread-count` | Непрочитанные |
| 208 | PATCH | `/notifications/:id/read` | Прочитать |
| 209 | PATCH | `/notifications/read-all` | Прочитать все |
| 210 | POST | `/notifications/fcm-token` | FCM токен |
| 211 | DELETE | `/notifications/fcm-token/:token` | Удалить FCM |
| 212 | POST | `/notifications/device-token` | Device токен |
| 213 | DELETE | `/notifications/device-token` | Удалить device |
| 214 | POST | `/notifications/telegram/link-token` | Линк Telegram |
| 215 | POST | `/notifications/telegram/verify` | Верификация |
| 216 | GET | `/notifications/alerts` | Алерты owner |
| 217 | PUT | `/notifications/alerts/:id/read` | Прочитать |
| 218 | PUT | `/notifications/alerts/read-all` | Все прочитаны |
| 219 | POST | `/notifications/run-debt-reminders` | Напоминания |
| 220 | GET | `/notifications/debt-reminders/due-soon` | Скоро срок |
| 221 | GET | `/notifications/debt-reminders/overdue` | Просрочены |
| 222 | GET | `/notifications/reminder-logs` | История напоминаний |

### Branches & Employees (17)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 223 | GET | `/branches` | Филиалы |
| 224 | GET | `/branches/:id` | Детали |
| 225 | GET | `/branches/:id/stats` | Статистика |
| 226 | POST | `/branches` | Создать |
| 227 | PATCH | `/branches/:id` | Обновить |
| 228 | DELETE | `/branches/:id` | Удалить |
| 229 | GET | `/employees` | Сотрудники |
| 230 | GET | `/employees/performance` | Производительность |
| 231 | GET | `/employees/suspicious-activity` | Подозрительное |
| 232 | GET | `/employees/:id` | Детали |
| 233 | POST | `/employees` | Создать |
| 234 | PATCH | `/employees/:id/status` | Статус |
| 235 | PATCH | `/employees/:id/transfer` | Перевод |
| 236 | PATCH | `/employees/:id/pos-access` | Доступ к POS |
| 237 | GET | `/employees/:id/performance` | Производительность |
| 238 | GET | `/employees/:id/suspicious-activity` | Подозрительное |
| 239 | DELETE | `/employees/:id` | Удалить |

### Analytics & Reports (29)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 240 | GET | `/analytics/sales-trend` | Тренд продаж |
| 241 | GET | `/analytics/top-products` | Топ товары |
| 242 | GET | `/analytics/dead-stock` | Неликвид |
| 243 | GET | `/analytics/margin` | Маржинальность |
| 244 | GET | `/analytics/abc` | ABC анализ |
| 245 | GET | `/analytics/cashier-performance` | Кассиры |
| 246 | GET | `/analytics/revenue` | Выручка |
| 247 | GET | `/analytics/hourly-heatmap` | Тепловая карта |
| 248 | GET | `/analytics/orders` | Сводка заказов |
| 249 | GET | `/analytics/branch-comparison` | Сравнение филиалов |
| 250 | GET | `/analytics/revenue-by-branch` | Выручка по филиалам |
| 251 | GET | `/analytics/stock-value` | Стоимость склада |
| 252 | GET | `/analytics/insights` | AI инсайты |
| 253 | GET | `/reports/daily` | Дневной отчёт |
| 254 | GET | `/reports/daily-revenue` | Дневная выручка |
| 255 | GET | `/reports/top-products` | Топ товары |
| 256 | GET | `/reports/sales-summary` | Сводка продаж |
| 257 | GET | `/reports/profit` | Прибыль |
| 258 | GET | `/reports/shift/:shiftId` | Отчёт смены |
| 259 | POST | `/reports/z-report` | Z-отчёт |
| 260 | GET | `/reports/z-reports` | История Z-отчётов |
| 261 | GET | `/reports/export/sales` | Экспорт продаж |
| 262 | GET | `/reports/export/order-items` | Экспорт позиций |
| 263 | GET | `/reports/export/products` | Экспорт товаров |
| 264 | GET | `/reports/export/inventory` | Экспорт склада |
| 265 | GET | `/reports/export/customers` | Экспорт клиентов |
| 266 | GET | `/reports/employee-activity` | Активность сотрудников |
| 267 | GET | `/reports/export/debts` | Экспорт долгов |
| 268 | GET | `/reports/export/pdf/:reportType` | PDF экспорт |

### Finance & Billing (15)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 269 | POST | `/finance/expenses` | Создать расход |
| 270 | GET | `/finance/expenses` | Расходы |
| 271 | GET | `/finance/expenses/summary` | Сводка расходов |
| 272 | DELETE | `/finance/expenses/:id` | Удалить |
| 273 | GET | `/finance/pnl` | P&L отчёт |
| 274 | GET | `/finance/balance-sheet` | Баланс |
| 275 | GET | `/finance/cash-flow` | Движение ДС |
| 276 | GET | `/billing/plans` | Тарифные планы |
| 277 | GET | `/billing/plans/:slug` | Детали плана |
| 278 | GET | `/billing/subscription` | Подписка tenant |
| 279 | POST | `/billing/upgrade` | Апгрейд |
| 280 | POST | `/billing/trial` | Начать trial |
| 281 | DELETE | `/billing/cancel` | Отмена |
| 282 | GET | `/billing/limits` | Лимиты плана |
| 283 | GET | `/billing/usage` | Использование |

### System & Utilities (37)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 284 | GET | `/health/live` | K8s liveness |
| 285 | GET | `/health/ping` | Ping |
| 286 | GET | `/health/ready` | Readiness (DB+Redis) |
| 287 | GET | `/health` | Общий health |
| 288 | GET | `/system/health` | Системное здоровье |
| 289 | GET | `/system/sync-status` | Статус синхронизации |
| 290 | GET | `/system/errors` | Ошибки |
| 291 | GET | `/metrics` | Prometheus метрики |
| 292 | GET | `/exchange-rate/latest` | Курс USD/UZS |
| 293 | GET | `/exchange-rate/history` | История курса |
| 294 | POST | `/exchange-rate/sync` | Обновить курс |
| 295 | POST | `/logs/client-error` | Ошибка клиента (public) |
| 296 | GET | `/audit-logs` | Аудит логи |
| 297 | GET | `/identity/branches` | Филиалы tenant |
| 298 | POST | `/sync/inbound` | POS → Server |
| 299 | GET | `/sync/outbound` | Server → POS |
| 300 | GET | `/sync/status` | Статус sync |
| 301 | POST | `/support/tickets` | Создать тикет |
| 302 | GET | `/support/tickets` | Тикеты |
| 303 | GET | `/support/tickets/:id` | Детали |
| 304 | POST | `/support/tickets/:id/messages` | Сообщение |
| 305 | PATCH | `/support/tickets/:id/status` | Статус тикета |
| 306 | GET | `/admin/support/tickets` | Все тикеты (admin) |
| 307 | POST | `/tasks` | Создать задачу |
| 308 | GET | `/tasks` | Задачи |
| 309 | PATCH | `/tasks/:id` | Обновить |
| 310 | DELETE | `/tasks/:id` | Удалить |
| 311 | GET | `/tax/report` | Налоговый отчёт |
| 312 | GET | `/tax/fiscal/:orderId` | Фискальный статус |
| 313 | POST | `/tax/fiscal/:orderId/retry` | Повтор фискализации |
| 314 | GET | `/real-estate/properties` | Недвижимость |
| 315 | GET | `/real-estate/stats` | Статистика |
| 316 | GET | `/real-estate/payments` | Арендные платежи |
| 317 | POST | `/upload` | Загрузка файла |
| 318 | POST | `/upload/bulk` | Множественная загрузка |
| 319 | GET | `/upload/presign` | Presigned URL |
| 320 | DELETE | `/upload` | Удалить файл |

### Shifts (mobile-owner aliases, 5)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 321 | GET | `/shifts` | Смены (paginated) |
| 322 | GET | `/shifts/current` | Текущая |
| 323 | GET | `/shifts/summary` | Сводка |
| 324 | GET | `/shifts/active` | Активные |
| 325 | GET | `/shifts/:id` | Детали |

### Alerts (mobile alias, 4)

| # | Метод | Эндпоинт | Назначение |
|---|-------|----------|------------|
| 326 | GET | `/alerts` | Алерты |
| 327 | GET | `/alerts/unread-count` | Непрочитанные |
| 328 | PATCH | `/alerts/:id/read` | Прочитать |
| 329 | PATCH | `/alerts/read-all` | Все прочитаны |

---

## Итого

| Что | Кол-во |
|-----|--------|
| RAOS существующие | 329 |
| Zzone существующие | 25 |
| Новые для коллаборации | 31 |
| **Всего** | **385** |
