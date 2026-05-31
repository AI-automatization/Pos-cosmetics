// ── inventory.types.ts ──────────────────────────────────
// Barcha inventory type va interface lar.
// Runtime kod yo'q — sof TypeScript deklaratsiya fayli.
// ─────────────────────────────────────────────────────────

// ── Generic ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Internal (inventory.api.ts va warehouse.api.ts uchun) ──

export interface WarehouseInvoiceItem {
  productId: string;
  productName?: string;
  product?: { name?: string };
  quantity?: number;
  qty?: number;
  unit?: string;
  purchasePrice?: number;
  costPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface WarehouseInvoice {
  id: string;
  invoiceNumber?: string;
  createdAt: string;
  supplier?: { name?: string };
  supplierName?: string;
  items?: WarehouseInvoiceItem[];
  itemsCount?: number;
  totalCost: number;
  status: string;
  notes?: string;
  note?: string;
}

/** Raw shape returned by GET /inventory/levels -- before client-side normalization */
export interface RawStockLevelItem {
  productId: string;
  name?: string;
  productName?: string;
  sku?: string;
  warehouseId: string;
  warehouseName?: string;
  totalQty?: number;
  stock?: number;
  quantity?: number;
  minStockLevel?: number;
}

/** Wrapper shapes the backend may use instead of a plain array */
export interface WrappedStockResponse {
  data?: RawStockLevelItem[];
  items?: RawStockLevelItem[];
}

// ── Stock ───────────────────────────────────────────────

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  quantity: number;
  minStockLevel: number;
  threshold: number;
  isLow: boolean;
}

export type StockItem = LowStockItem;

export interface ProductStockLevel {
  warehouseId: string;
  warehouseName: string;
  stock: number;
  nearestExpiry: string | null;
}

// ── Receipts ────────────────────────────────────────────

export interface ReceiptItem {
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  costPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  supplierName: string;
  itemsCount: number;
  totalCost: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  items?: ReceiptItem[];
  notes?: string;
}

export interface ReceiptListResponse {
  items: Receipt[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateReceiptBody {
  supplierName: string;
  invoiceNumber?: string;
  items: {
    productId: string;
    quantity: number;
    costPrice: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  notes?: string;
}

export interface CreateReceiptResponse {
  id: string;
  receiptNumber: string;
  date: string;
  totalCost: number;
  itemsCount: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
}

// ── Transfers ───────────────────────────────────────────

export interface TransferItem {
  productId: string;
  quantity: number;
  warehouseId?: string;
}

export type TransferStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'SHIPPED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface StockTransferListItem {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  status: TransferStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: { name: string; sku: string };
  }[];
  fromBranch: { name: string };
  toBranch: { name: string };
  requestedBy: { firstName: string; lastName: string };
}

export interface TransferListResponse {
  items: StockTransferListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TransferListParams {
  status?: TransferStatus;
  branchId?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransferBody {
  fromBranchId: string;
  toBranchId: string;
  items: TransferItem[];
  notes?: string;
}

export interface CreateTransferResponse {
  id: string;
  status: string;
  fromBranchId: string;
  toBranchId: string;
  createdAt: string;
}

// ── Inventory Items ─────────────────────────────────────

export type InventoryItemStatus =
  | 'out_of_stock'
  | 'low'
  | 'normal'
  | 'expiring'
  | 'expired';

export interface InventoryItem {
  productId: string;
  productName: string;
  barcode: string | null;
  branchName: string | null;
  branchId: string | null;
  quantity: number;
  unit: string;
  stockValue: number;
  expiryDate: string | null;
  status: InventoryItemStatus;
}

export interface InventoryItemsResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
}

// ── Restock ─────────────────────────────────────────────

export interface RestockRequestBody {
  productId: string;
  productName: string;
  currentStock: number;
}

export interface RestockRequestResponse {
  success: boolean;
  notifiedCount: number;
}

// ── Invoices ────────────────────────────────────────────

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string | null;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  createdAt: string;
  totalCost: number;
  itemsCount: number;
  supplier: { id: string; name: string } | null;
  createdBy: { firstName: string; lastName: string } | null;
}

export interface InvoiceDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  note: string | null;
  items: InvoiceDetailItem[];
}

export interface InvoiceListResponse {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
}

// ── Warehouse Dashboard ─────────────────────────────────

export interface WarehouseDashboardStats {
  totalProducts: number;
  todayMovementsIn: number;
  todayMovementsOut: number;
  lowStockCount: number;
  expiryCount: number;
}

export interface DashboardLowStockItem {
  productId: string;
  name: string;
  totalQty: number;
}

export interface DashboardExpiryItem {
  productId: string;
  expiryDate: string;
  batchNumber: string | null;
  quantity: number;
  product: { name: string };
}

export interface DashboardMovement {
  id: string;
  type:
    | 'IN'
    | 'OUT'
    | 'ADJUSTMENT'
    | 'WRITE_OFF'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'RETURN_IN';
  quantity: number;
  createdAt: string;
  note: string | null;
  product: { name: string };
}

export interface WarehouseDashboardResponse {
  stats: WarehouseDashboardStats;
  lowStockItems: DashboardLowStockItem[];
  expiryItems: DashboardExpiryItem[];
  recentMovements: DashboardMovement[];
}

export interface WarehouseAlertsResponse {
  expired: number;
  soonExpiring: number;
  alerts: {
    type: 'EXPIRED' | 'EXPIRING_SOON';
    productId: string;
    expiryDate: string;
    batchNumber: string | null;
    product: { name: string };
  }[];
}

// ── Tester / Sample ─────────────────────────────────────

export interface OpenTesterDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  costPrice: number;
  note?: string;
}

export interface OpenTesterResponse {
  movement: { id: string };
  expense: { id: string };
  totalCost: number;
}

export interface TesterMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: string;
  quantity: number;
  costPrice: number | null;
  note: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string | null };
  warehouse: { id: string; name: string };
}

export interface TesterListResponse {
  items: TesterMovement[];
  totalCost: number;
  count: number;
}
