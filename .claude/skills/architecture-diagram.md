---
name: architecture-diagram
description: Creates comprehensive HTML architecture diagrams with SVG visualizations showing business context, data flows, processing pipelines, and system architecture. Use when you need to document or visualize system design.
argument-hint: what to diagram (e.g., "RAOS full system", "payment flow", "inventory module")
---

# Architecture Diagram Creator

Creates comprehensive HTML architecture diagrams with SVG visualizations.

## User Arguments

```
$ARGUMENTS
```

Describe what to diagram:
- Full system: "RAOS full system architecture"
- Module: "inventory module", "payment flow"
- Flow: "SaleCreated event flow", "offline sync flow"

## Workflow

### 1. Analyze Project Structure

Read relevant files to understand the system:
- README.md, CLAUDE.md for overview
- Package structure (apps/, packages/)
- Key service files for the target area

### 2. Extract Key Elements

Identify:
- **Components**: Services, modules, databases, queues
- **Data flows**: What data moves between components
- **Processing stages**: Transform, validate, store, notify
- **Integrations**: External services, APIs

### 3. Create HTML Diagram File

Output an HTML file at `docs/diagrams/[name].html` with:

```html
<!DOCTYPE html>
<html>
<head>
  <title>[System Name] Architecture</title>
  <style>
    /* Color coding */
    .data { fill: #4299e1; }        /* Blue — data stores */
    .processing { fill: #ed8936; }  /* Orange — processing */
    .ai { fill: #9f7aea; }          /* Purple — AI/analytics */
    .output { fill: #48bb78; }      /* Green — outputs */
    .infra { fill: #718096; }       /* Gray — infrastructure */
    .external { fill: #fc8181; }    /* Red — external services */
  </style>
</head>
<body>
  <!-- Section 1: Business Context -->
  <!-- Section 2: System Architecture (SVG) -->
  <!-- Section 3: Data Flow (SVG) -->
  <!-- Section 4: Module Breakdown -->
  <!-- Section 5: Key Flows -->
</body>
</html>
```

## Six Essential Sections

### 1. Business Context
- Objectives and value proposition
- User roles (Admin, Cashier, Warehouse, Owner)
- Key metrics and KPIs

### 2. System Architecture (SVG)
Layered component diagram:
```
[Client Layer]   Web Admin | POS Desktop | Mobile App | Telegram Bot
[API Layer]      NestJS API (port 3000)
[Service Layer]  Identity | Catalog | Inventory | Sales | Payments | Ledger
[Worker Layer]   BullMQ Workers | Fiscal Queue | Sync Queue
[Data Layer]     PostgreSQL | Redis | MinIO S3
```

### 3. Data Flow (SVG)
Arrows showing data movement between components.

### 4. Processing Pipeline
Multi-stage transformation for key flows (e.g., Sale → Ledger → Fiscal → Notification).

### 5. Module Breakdown
Each domain module with responsibilities:
- Input/Output
- Key tables
- Events emitted/consumed

### 6. Deployment
- Docker Compose services
- Port mapping
- Environment tiers (dev/staging/prod)

## Color Coding Standard

| Color | Meaning | Hex |
|-------|---------|-----|
| Blue | Data stores, databases | #4299e1 |
| Orange | Processing, services | #ed8936 |
| Purple | AI/Analytics | #9f7aea |
| Green | Outputs, results | #48bb78 |
| Gray | Infrastructure | #718096 |
| Red | External integrations | #fc8181 |

## RAOS Example: Event Flow Diagram

For `SaleCreated` event flow:
```
SaleCreated Event
    ↓
[Inventory Module] → DeductStock → StockMovement record
[Tax Module] → CalculateTax → TaxEntry record
[Ledger Module] → GenerateEntries → double-entry records
[Fiscal Module] → QueueReceipt → async fiscal receipt
[Analytics Module] → UpdateMetrics → dashboard data
[Notifications Module] → TelegramAlert → owner notification
```

## Output

Save as `docs/diagrams/[descriptive-name].html` and confirm the file path.
