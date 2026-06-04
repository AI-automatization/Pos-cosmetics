export interface ProductImportRow {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  unit?: string;
  categoryName?: string;
  description?: string;
  minStock?: number;
}

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number; // rows that failed validation or threw
  errors: string[]; // `Row N: <reason>` — human-readable, per row
}

export interface ImportProgress {
  processed: number;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}
