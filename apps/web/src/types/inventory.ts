// Inventory domain types
// TODO: Move to packages/types/ after backend implements schemas (T-021)

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';
export type MovementRefType = 'PURCHASE' | 'SALE' | 'MANUAL' | 'DAMAGE' | 'RETURN';
export type StockOutReason = 'DAMAGE' | 'WRITE_OFF' | 'OTHER';
export type StockStatus = 'OK' | 'LOW' | 'OUT';

export interface StockLevel {
  productId: string;
  productName: string;
  barcode: string | null;
  sku: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: StockStatus;
  costPrice: number;
  categoryName: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  product?: { id: string; name: string; sku?: string };
  type: MovementType;
  quantity: number;
  referenceType?: MovementRefType;
  referenceId?: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  costPrice: number;
  note: string | null;
  userId?: string;
  createdAt: string;
  supplier?: string;
  user?: { id: string; firstName?: string; lastName?: string; name?: string };
}

// --- DTOs ---

export interface StockInItem {
  productId: string;
  quantity: number;
  costPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface StockInDto {
  supplier: string;
  items: StockInItem[];
  notes?: string;
}

export interface StockOutItem {
  productId: string;
  quantity: number;
}

export interface StockOutDto {
  reason: StockOutReason;
  items: StockOutItem[];
  notes?: string;
}

export interface StockQuery {
  search?: string;
  lowStockOnly?: boolean;
}

// ─── Stock Transfers ───

export type TransferStatus = 'REQUESTED' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';

export interface TransferItem {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku?: string };
  quantity: number;
}

export interface StockTransfer {
  id: string;
  fromBranchId: string;
  fromBranch?: { id: string; name: string };
  toBranchId: string;
  toBranch?: { id: string; name: string };
  status: TransferStatus;
  items: TransferItem[];
  notes?: string;
  requestedBy?: { id: string; firstName?: string; lastName?: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransferDto {
  fromBranchId: string;
  toBranchId: string;
  items: { productId: string; quantity: number }[];
  notes?: string;
}
