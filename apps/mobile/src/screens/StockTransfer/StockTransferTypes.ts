// StockTransferTypes.ts — typelar va interfeyslar

export interface TransferItem {
  productId:    string;
  productName:  string;
  quantity:     number;
  warehouseId:  string;
  warehouseName: string;
  availableQty: number;
}

export interface StockLevel {
  readonly productId:     string;
  readonly name:          string;
  readonly warehouseId:   string;
  readonly warehouseName: string;
  readonly totalQty:      number;
  readonly minStockLevel: number | null;
}

export interface TransferPayload {
  readonly fromBranchId: string;
  readonly toBranchId:   string;
  readonly items: ReadonlyArray<{
    readonly productId:   string;
    readonly quantity:    number;
    readonly warehouseId?: string;
  }>;
  readonly notes?: string;
}

export interface TransferResponse {
  readonly id:           string;
  readonly status:       string;
  readonly fromBranchId: string;
  readonly toBranchId:   string;
  readonly createdAt:    string;
}
