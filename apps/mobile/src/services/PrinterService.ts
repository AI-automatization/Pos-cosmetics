// ─── Sunmi V2 Pro Built-in Thermal Printer Service ──────────────────────────
// Safe dynamic import — module may not exist (Expo Go, non-Sunmi devices)

import type {
  PrinterStatus,
  PrintResult,
  ReceiptData,
  SunmiPrinterModule,
  TextOptions,
} from './printer.types';

export type { PrinterStatus, PrintResult, ReceiptData, TextOptions };
export type { ReceiptItem, LoyaltyPoints } from './printer.types';

let SunmiPrinter: SunmiPrinterModule | null = null;
try {
  SunmiPrinter = require('react-native-sunmi-inner-printer');
} catch {
  // Not available — isAvailable() will return false
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ALIGN_LEFT = 0;
const ALIGN_CENTER = 1;
const ALIGN_RIGHT = 2;

const FONT_SM = 20;
const FONT_MD = 24;
const FONT_LG = 32;

const QR_SIZE = 8;
const QR_ERROR_LEVEL = 3; // H — 30% error correction
const BARCODE_SYMBOLOGY = 8; // CODE128
const BARCODE_HEIGHT = 100;
const BARCODE_WIDTH = 2;
const BARCODE_TEXT_BELOW = 2;

const FEED_LINES = 4;
const SEPARATOR = '--------------------------------';
const ITEM_NAME_MAX_LEN = 16;

const PRINTER_STATE_NORMAL = 1;
const PRINTER_STATE_NO_PAPER = 4;
const PRINTER_STATE_OVERHEAT = 5;

const COL_WIDTHS_3 = [16, 6, 10];
const COL_ALIGNS_3 = [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT];

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatReceiptDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d}.${m}.${y} ${h}:${min}`;
}

function mapPrinterState(state: number): PrinterStatus {
  if (state === PRINTER_STATE_NORMAL) return 'NORMAL';
  if (state === PRINTER_STATE_NO_PAPER) return 'OUT_OF_PAPER';
  if (state === PRINTER_STATE_OVERHEAT) return 'OVERHEAT';
  return 'ERROR';
}

async function applyStyle(options?: TextOptions): Promise<void> {
  if (!SunmiPrinter) return;
  const alignMap = { left: ALIGN_LEFT, center: ALIGN_CENTER, right: ALIGN_RIGHT };
  await SunmiPrinter.setAlignment(alignMap[options?.align ?? 'left']);
  await SunmiPrinter.setFontSize(options?.fontSize ?? FONT_MD);
}

// ─── Service ────────────────────────────────────────────────────────────────

export const printerService = {
  isAvailable(): boolean {
    return SunmiPrinter !== null;
  },

  async getStatus(): Promise<PrinterStatus> {
    if (!SunmiPrinter) return 'UNAVAILABLE';
    try {
      return mapPrinterState(await SunmiPrinter.updatePrinterState());
    } catch {
      return 'ERROR';
    }
  },

  async init(): Promise<void> {
    if (!SunmiPrinter) return;
    await SunmiPrinter.printerInit();
  },

  async printText(text: string, options?: TextOptions): Promise<void> {
    if (!SunmiPrinter) return;
    await applyStyle(options);
    await SunmiPrinter.printText(text + '\n');
  },

  async printLine(): Promise<void> {
    if (!SunmiPrinter) return;
    await SunmiPrinter.setAlignment(ALIGN_CENTER);
    await SunmiPrinter.setFontSize(FONT_SM);
    await SunmiPrinter.printText(SEPARATOR + '\n');
  },

  async printQR(data: string, size: number = QR_SIZE): Promise<void> {
    if (!SunmiPrinter) return;
    await SunmiPrinter.setAlignment(ALIGN_CENTER);
    await SunmiPrinter.printQRCode(data, size, QR_ERROR_LEVEL);
  },

  async printBarcode(data: string): Promise<void> {
    if (!SunmiPrinter) return;
    await SunmiPrinter.setAlignment(ALIGN_CENTER);
    await SunmiPrinter.printBarCode(
      data, BARCODE_SYMBOLOGY, BARCODE_HEIGHT, BARCODE_WIDTH, BARCODE_TEXT_BELOW,
    );
  },

  async feedAndCut(): Promise<void> {
    if (!SunmiPrinter) return;
    await SunmiPrinter.lineWrap(FEED_LINES);
    await SunmiPrinter.cutPaper();
  },

  async printReceipt(data: ReceiptData): Promise<PrintResult> {
    if (!SunmiPrinter) return { success: false, error: 'Printer mavjud emas' };
    try {
      const status = await this.getStatus();
      if (status !== 'NORMAL') return { success: false, error: `Printer holati: ${status}` };

      await this.init();
      await printReceiptHeader(this, data);
      await printReceiptItems(data);
      await printReceiptTotals(this, data);
      await printReceiptFooter(this, data);
      await this.feedAndCut();

      return { success: true };
    } catch (err) {
      return { success: false, error: extractMsg(err, 'Chop etishda xatolik') };
    }
  },

  async testPrint(): Promise<PrintResult> {
    if (!SunmiPrinter) return { success: false, error: 'Printer mavjud emas' };
    try {
      const status = await this.getStatus();
      if (status !== 'NORMAL') return { success: false, error: `Printer holati: ${status}` };

      await this.init();
      await this.printText('RAOS — Test chop', { bold: true, fontSize: FONT_LG, align: 'center' });
      await this.printLine();
      await this.printText(`Sana: ${formatReceiptDate(new Date())}`, { fontSize: FONT_SM });
      await this.printText('Printer ishlayapti!', { fontSize: FONT_MD, align: 'center' });
      await this.printLine();
      await this.feedAndCut();

      return { success: true };
    } catch (err) {
      return { success: false, error: extractMsg(err, 'Test chop xatolik') };
    }
  },
};

// ─── Receipt section printers ───────────────────────────────────────────────

type Printer = typeof printerService;

async function printReceiptHeader(p: Printer, data: ReceiptData): Promise<void> {
  await p.printText(data.companyName, { bold: true, fontSize: FONT_LG, align: 'center' });
  if (data.branchName) {
    await p.printText(data.branchName, { fontSize: FONT_SM, align: 'center' });
  }
  await p.printLine();
  await p.printText(`Sana: ${formatReceiptDate(data.date)}`, { fontSize: FONT_SM });
  if (data.cashierName) {
    await p.printText(`Kassir: ${data.cashierName}`, { fontSize: FONT_SM });
  }
  await p.printText(`Buyurtma: #${data.orderNumber}`, { fontSize: FONT_SM });
  await p.printLine();
}

async function printReceiptItems(data: ReceiptData): Promise<void> {
  if (!SunmiPrinter) return;
  for (const item of data.items) {
    const name = item.name.length > ITEM_NAME_MAX_LEN
      ? item.name.slice(0, ITEM_NAME_MAX_LEN - 1) + '.'
      : item.name;
    await SunmiPrinter.printColumnsText(
      [name, `${item.qty}x${formatAmount(item.unitPrice)}`, formatAmount(item.total)],
      COL_WIDTHS_3,
      COL_ALIGNS_3,
    );
  }
}

async function printReceiptTotals(p: Printer, data: ReceiptData): Promise<void> {
  await p.printLine();
  await p.printText(`Jami:     ${formatAmount(data.subtotal)}`, { fontSize: FONT_MD });
  if (data.discount && data.discount > 0) {
    await p.printText(`Chegirma: -${formatAmount(data.discount)}`, { fontSize: FONT_MD });
  }
  if (data.tax && data.tax > 0) {
    await p.printText(`Soliq:    ${formatAmount(data.tax)}`, { fontSize: FONT_MD });
  }
  await p.printText(`JAMI:     ${formatAmount(data.total)}`, { bold: true, fontSize: FONT_LG });
  await p.printText(`To'lov: ${data.paymentMethod}`, { fontSize: FONT_SM });
  if (data.receivedAmount !== undefined) {
    await p.printText(`Qabul qilindi: ${formatAmount(data.receivedAmount)}`, { fontSize: FONT_SM });
  }
  if (data.change !== undefined && data.change > 0) {
    await p.printText(`Qaytim: ${formatAmount(data.change)}`, { fontSize: FONT_SM });
  }
  if (data.loyaltyPoints) {
    const lp = data.loyaltyPoints;
    if (lp.earned) await p.printText(`Ball qo'shildi: +${lp.earned}`, { fontSize: FONT_SM });
    if (lp.redeemed) await p.printText(`Ball ishlatildi: -${lp.redeemed}`, { fontSize: FONT_SM });
    if (lp.balance !== undefined) await p.printText(`Ball qoldig'i: ${lp.balance}`, { fontSize: FONT_SM });
  }
}

async function printReceiptFooter(p: Printer, data: ReceiptData): Promise<void> {
  await p.printLine();
  if (data.fiscalId) {
    await p.printText(`Fiskal ID: ${data.fiscalId}`, { fontSize: FONT_SM, align: 'center' });
  }
  if (data.qrData) {
    await p.printQR(data.qrData);
  }
  await p.printText('Xaridingiz uchun rahmat!', { fontSize: FONT_MD, align: 'center' });
}
