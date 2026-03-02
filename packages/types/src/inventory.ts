// ─── INVENTORY TYPES ──────────────────────────────────────────

export type StockMovementType =
  | 'IN'
  | 'OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN_IN';

export interface Warehouse {
  id: string;
  tenantId: string;
  branchId: string | null;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  warehouseId: string;
  productId: string;
  userId: string | null;
  type: StockMovementType;
  quantity: number;
  costPrice: number | null;
  note: string | null;
  refId: string | null;
  refType: string | null;
  batchNumber: string | null;
  expiryDate: Date | null;
  createdAt: Date;
}

export interface StockLevel {
  productId: string;
  warehouseId: string;
  stock: number;
}

export interface ExpiringProduct {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  batchNumber: string | null;
  expiryDate: Date;
  qty: number;
  daysLeft: number;
}

// ─── REQUEST TYPES ────────────────────────────────────────────

export interface CreateWarehousePayload {
  name: string;
  branchId?: string;
}

export interface CreateStockMovementPayload {
  warehouseId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  costPrice?: number;
  note?: string;
  batchNumber?: string;
  expiryDate?: string;
}
