// ─── Printer Service Types ───────────────────────────────────────────────────

export type PrinterStatus =
  | 'NORMAL'
  | 'OUT_OF_PAPER'
  | 'OVERHEAT'
  | 'ERROR'
  | 'UNAVAILABLE';

export interface ReceiptItem {
  readonly name: string;
  readonly qty: number;
  readonly unitPrice: number;
  readonly total: number;
}

export interface LoyaltyPoints {
  readonly earned?: number;
  readonly redeemed?: number;
  readonly balance?: number;
}

export interface ReceiptData {
  readonly companyName: string;
  readonly branchName?: string;
  readonly orderNumber: number | string;
  readonly cashierName?: string;
  readonly items: ReadonlyArray<ReceiptItem>;
  readonly subtotal: number;
  readonly discount?: number;
  readonly tax?: number;
  readonly total: number;
  readonly paymentMethod: string;
  readonly receivedAmount?: number;
  readonly change?: number;
  readonly loyaltyPoints?: LoyaltyPoints;
  readonly fiscalId?: string;
  readonly qrData?: string;
  readonly date: Date;
}

export interface PrintResult {
  readonly success: boolean;
  readonly error?: string;
}

export interface TextOptions {
  readonly bold?: boolean;
  readonly fontSize?: number;
  readonly align?: 'left' | 'center' | 'right';
}

export interface SunmiPrinterModule {
  printerInit(): Promise<void>;
  updatePrinterState(): Promise<number>;
  printText(text: string): Promise<void>;
  setAlignment(align: number): Promise<void>;
  setFontSize(size: number): Promise<void>;
  printQRCode(data: string, size: number, errorLevel: number): Promise<void>;
  printBarCode(
    data: string,
    symbology: number,
    height: number,
    width: number,
    textPosition: number,
  ): Promise<void>;
  printColumnsText(
    texts: string[],
    widths: number[],
    aligns: number[],
  ): Promise<void>;
  lineWrap(lines: number): Promise<void>;
  cutPaper(): Promise<void>;
}
