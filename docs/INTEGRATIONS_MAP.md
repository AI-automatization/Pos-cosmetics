# RAOS Integrations Map

> Obsidian-compatible. Mermaid diagrams render natively.
> Updated: 2026-06-11

---

## Overview

```mermaid
graph TB
    subgraph RAOS["RAOS Backend (NestJS)"]
        API["api.raos.uz"]
        ZM["ZzoneModule"]
        AM["AdetalModule"]
        IC[("IntegrationConfig<br/>provider + tenantId")]
        EE["EventEmitter2"]
    end

    subgraph ZZone["ZZone (Express + MongoDB)"]
        ZB["zzoneback-production.up.railway.app"]
    end

    subgraph Adetal["Adetal (Express + MongoDB)"]
        AB["api.adetal.uz"]
    end

    subgraph Clients["Клиенты"]
        POS["POS Desktop"]
        WEB["Admin Panel"]
        MOB["Mobile App"]
    end

    POS -->|sale.created| EE
    WEB -->|product.created| EE
    MOB -->|inventory.movement| EE

    EE -->|auto-sync| ZM
    EE -->|auto-sync| AM

    ZM -->|outbound push| ZB
    ZB -->|inbound API| ZM

    AM -->|outbound push| AB
    AM -->|cron poll orders| AB

    ZM --- IC
    AM --- IC

    style RAOS fill:#1a1a2e,color:#fff
    style ZZone fill:#16213e,color:#fff
    style Adetal fill:#0f3460,color:#fff
    style Clients fill:#533483,color:#fff
```

---

## ZZone Integration

```mermaid
flowchart LR
    subgraph Inbound["ZZone → RAOS (26 endpoints)"]
        direction TB
        P1["Products (5)"]
        O1["Orders (6)"]
        S1["Sellers (3)"]
        ST1["Stores (4)"]
        V1["Vehicles (7)"]
        H1["Health (1)"]
    end

    subgraph Outbound["RAOS → ZZone (auto-push)"]
        direction TB
        SYNC["ZzoneSyncListener"]
        WH["ZzoneWebhookService"]
        OUT["ZzoneOutboundService"]
    end

    subgraph Events["Domain Events"]
        E1["product.created"]
        E2["product.updated"]
        E3["product.deleted"]
        E4["sale.created"]
        E5["inventory.movement"]
    end

    Events --> SYNC --> OUT
    Events --> WH

    style Inbound fill:#2d6a4f,color:#fff
    style Outbound fill:#40916c,color:#fff
    style Events fill:#52b788,color:#000
```

**Auth:** `X-Api-Key` header (timing-safe comparison)
**Swagger:** `https://api.raos.uz/api/v1/zzone/docs`
**Docs:** [[RAOS_ZZONE_COLLABORATION]]

| Файл | Назначение |
|------|-----------|
| `zzone.module.ts` | NestJS module |
| `zzone-inbound.controller.ts` | 26 public endpoints (ZZone вызывает) |
| `zzone-inbound.service.ts` | Business logic (products, orders, sellers, stores) |
| `zzone-outbound.service.ts` | HTTP client RAOS → ZZone |
| `zzone-sync.listener.ts` | Auto-sync on domain events |
| `zzone-webhook.service.ts` | Sends webhooks TO ZZone |
| `zzone-webhook.listener.ts` | Bridges events → webhooks |
| `vehicle.controller.ts` | Vehicle CRUD + compatibility |
| `vehicle.service.ts` | Vehicle data management |
| `dto/zzone.dto.ts` | DTOs с class-validator |

---

## Adetal Integration

```mermaid
flowchart LR
    subgraph Controller["AdetalController (16 endpoints)"]
        direction TB
        HS["Health (1)"]
        SS["Store (5)"]
        PS["Products (2)"]
        OS["Orders (3)"]
        AS["Analytics (1)"]
        RS["Reviews (1)"]
        NS["Notifications (2)"]
        CS["Config (1)"]
    end

    subgraph Services["Background Services"]
        direction TB
        OUT2["AdetalOutboundService<br/>(HTTP client + token mgmt)"]
        INB["AdetalInboundService<br/>(order processing)"]
        SYNC2["AdetalSyncListener<br/>(event → push)"]
        POLL["AdetalOrderPollerService<br/>(cron */2 * * * *)"]
    end

    subgraph Events2["Domain Events"]
        E21["product.created"]
        E22["product.updated"]
        E23["product.deleted"]
        E24["sale.created"]
        E25["inventory.movement"]
    end

    Controller --> OUT2
    Events2 --> SYNC2 --> OUT2
    POLL --> OUT2
    POLL --> INB

    style Controller fill:#7b2cbf,color:#fff
    style Services fill:#9d4edd,color:#fff
    style Events2 fill:#c77dff,color:#000
```

**Auth:** `Bearer <accessToken>` (auto-refresh, 1h TTL)
**Swagger:** `https://api.raos.uz/api/v1/adetal/docs`
**Docs:** [[RAOS_ADETAL_COLLABORATION]]

| Файл | Назначение |
|------|-----------|
| `adetal.module.ts` | NestJS module |
| `adetal.controller.ts` | 16 endpoints с `@CurrentTenant` isolation |
| `adetal-outbound.service.ts` | HTTP client (12 секций Adetal API) + token refresh |
| `adetal-inbound.service.ts` | Adetal orders → RAOS orders (idempotent) |
| `adetal-sync.listener.ts` | Auto-sync product/stock на domain events |
| `adetal-order-poller.service.ts` | Cron polling заказов каждые 2 мин |
| `adetal.constants.ts` | Status maps, constants |
| `dto/adetal.dto.ts` | DTOs с class-validator + Swagger |

---

## Сравнение интеграций

```mermaid
graph LR
    subgraph Shared["Общие компоненты"]
        IC2[("IntegrationConfig")]
        VEH["Vehicle + Compatibility"]
        EVT["Domain Events (5)"]
    end

    subgraph ZZ["ZZone"]
        Z_AUTH["X-Api-Key"]
        Z_DIR["Bidirectional"]
        Z_WH["Webhooks ✅"]
        Z_MOD["Instant publish"]
    end

    subgraph AD["Adetal"]
        A_AUTH["Bearer + Refresh"]
        A_DIR["Outbound + Polling"]
        A_WH["Webhooks ❌"]
        A_MOD["PENDING → APPROVED"]
    end

    Shared --- ZZ
    Shared --- AD

    style Shared fill:#264653,color:#fff
    style ZZ fill:#2a9d8f,color:#fff
    style AD fill:#e76f51,color:#fff
```

| Аспект | ZZone | Adetal |
|--------|-------|--------|
| Auth | X-Api-Key (static) | Bearer token (1h + refresh 30d) |
| Direction | Bidirectional | Outbound + polling |
| Webhooks | RAOS → ZZone (4 events) | Нет |
| Product flow | Instant | PENDING → APPROVED |
| Images | URL reference | multipart/form-data |
| Order import | ZZone POST → RAOS | RAOS cron poll → Adetal |
| Endpoints | 26 inbound + outbound | 16 controller + outbound |
| Provider key | `ZZONE` | `ADETAL` |

---

## Data Flow — Order Lifecycle

```mermaid
sequenceDiagram
    participant C as Клиент (ZZone/Adetal)
    participant MKT as Маркетплейс API
    participant RAOS as RAOS Backend
    participant DB as PostgreSQL
    participant EVT as EventEmitter

    Note over C,MKT: ZZone: POST /zzone/orders<br/>Adetal: cron poll GET /api/orders/seller

    C->>MKT: Заказ создан
    MKT->>RAOS: Order data
    RAOS->>DB: Idempotency check (notes prefix)
    alt Новый заказ
        RAOS->>DB: Stock check (StockSnapshot)
        RAOS->>DB: Create Order (origin: ZZONE/ADETAL)
        RAOS->>DB: Create OrderItem
        RAOS->>EVT: emit sale.created
        EVT->>RAOS: ZzoneSyncListener / AdetalSyncListener
        RAOS->>MKT: Update stock
    else Дупликат
        RAOS-->>MKT: Return existing order ID
    end
```

---

## Admin Config Flow

```mermaid
flowchart TD
    SA["Super Admin Panel"] -->|POST /admin/tenants| CREATE["Создать tenant<br/>(businessType: AUTO_PARTS)"]
    CREATE -->|auto-provision| ZC["IntegrationConfig<br/>provider=ZZONE<br/>isActive=false"]
    CREATE -->|auto-provision| AC["IntegrationConfig<br/>provider=ADETAL<br/>isActive=false"]

    SA -->|PATCH .../zzone-config| ZC
    SA -->|PATCH .../adetal-config| AC

    ZC -->|token set + isActive=true| ZS["ZZone Sync Active"]
    AC -->|phone+password → login| AL["Adetal Login"]
    AL -->|tokens saved| AS["Adetal Sync Active"]

    style SA fill:#f4a261,color:#000
    style ZS fill:#2a9d8f,color:#fff
    style AS fill:#e76f51,color:#fff
```

---

## Файловая структура

```
apps/api/src/integrations/
├── zzone/                          ← ZZone integration
│   ├── zzone.module.ts
│   ├── zzone-inbound.controller.ts  (349 строк, 26 endpoints)
│   ├── zzone-inbound.service.ts     (546 строк)
│   ├── zzone-outbound.service.ts    (122 строк)
│   ├── zzone-sync.listener.ts       (188 строк)
│   ├── zzone-webhook.service.ts     (109 строк)
│   ├── zzone-webhook.listener.ts    (80 строк)
│   ├── vehicle.controller.ts        (154 строк)
│   ├── vehicle.service.ts           (137 строк)
│   └── dto/zzone.dto.ts
│
└── adetal/                          ← Adetal integration
    ├── adetal.module.ts              (18 строк)
    ├── adetal.controller.ts          (192 строк, 16 endpoints)
    ├── adetal-outbound.service.ts    (400 строк)
    ├── adetal-inbound.service.ts     (172 строк)
    ├── adetal-sync.listener.ts       (201 строк)
    ├── adetal-order-poller.service.ts (93 строк)
    ├── adetal.constants.ts           (35 строк)
    └── dto/adetal.dto.ts             (145 строк)
```

---

## Production URLs

| Сервис | URL |
|--------|-----|
| ZZone Swagger | `https://api.raos.uz/api/v1/zzone/docs` |
| ZZone Health | `https://api.raos.uz/api/v1/zzone/health` |
| Adetal Swagger | `https://api.raos.uz/api/v1/adetal/docs` |
| Adetal Health | `https://api.raos.uz/api/v1/adetal/health` |
| ZZone Backend | `https://zzoneback-production.up.railway.app` |
| Adetal Backend | `https://api.adetal.uz` |

---

## Tags

#raos #integrations #zzone #adetal #marketplace #auto-parts #api

---

_INTEGRATIONS_MAP.md | RAOS | 2026-06-11_
