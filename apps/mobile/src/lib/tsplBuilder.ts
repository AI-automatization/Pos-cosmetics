/**
 * TSPL Command Builder — thermal label printers (TSC, Xprinter, etc.)
 * DPI: 203 (standard for budget printers). 1mm = 8 dots.
 */

export interface LabelData {
  readonly name: string;
  readonly sku?: string | null;
  readonly barcode?: string | null;
  readonly price: number;
  readonly expiryDate?: string | null;
}

export type LabelSize = '30x20' | '40x30' | '58x40';

// ─── Constants ──────────────────────────────────────────────────────────────────

const DOTS_PER_MM = 8;
const GAP_MM = 2;
const PAD = 8;
const BC_HEIGHT = 40;
const FONT = '2'; // TSPL monospace font

const SIZE_CONFIGS: Record<LabelSize, { wMm: number; hMm: number }> = {
  '30x20': { wMm: 30, hMm: 20 },
  '40x30': { wMm: 40, hMm: 30 },
  '58x40': { wMm: 58, hMm: 40 },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function fmtPrice(amount: number): string {
  const s = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${s} so'm`;
}

function trunc(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 2) + '..';
}

function txt(x: number, y: number, mx: number, my: number, content: string): string {
  return `TEXT ${x},${y},"${FONT}",0,${mx},${my},"${content}"`;
}

// ─── Builder ────────────────────────────────────────────────────────────────────

export function buildTsplLabel(data: LabelData, size: LabelSize, copies: number): string {
  const cfg = SIZE_CONFIGS[size];
  const wDots = cfg.wMm * DOTS_PER_MM;
  const printArea = wDots - PAD * 2;
  const maxS = Math.floor(printArea / 12); // chars at 1x scale (~12 dots/char)
  const maxL = Math.floor(printArea / 24); // chars at 2x scale

  const cmd: string[] = [
    `SIZE ${cfg.wMm} mm, ${cfg.hMm} mm`,
    `GAP ${GAP_MM} mm, 0`,
    'CLS',
  ];

  let y = PAD;

  // Product name — up to 2 lines at 1x scale
  const nameFirst = trunc(data.name, maxS);
  cmd.push(txt(PAD, y, 1, 1, nameFirst));
  y += 20;
  if (data.name.length > maxS) {
    cmd.push(txt(PAD, y, 1, 1, trunc(data.name.slice(maxS), maxS)));
    y += 20;
  }
  y += 4; // spacing after name

  // SKU (optional)
  if (data.sku) {
    cmd.push(txt(PAD, y, 1, 1, trunc(`SKU: ${data.sku}`, maxS)));
    y += 20;
  }

  // Barcode CODE128 (optional)
  if (data.barcode) {
    cmd.push(`BARCODE ${PAD},${y},"128",${BC_HEIGHT},1,0,2,4,"${data.barcode}"`);
    y += BC_HEIGHT + 20;
  }

  // Price — bold/large (2x multiplier)
  cmd.push(txt(PAD, y, 2, 2, trunc(fmtPrice(data.price), maxL)));
  y += 32;

  // Expiry date (optional)
  if (data.expiryDate) {
    cmd.push(txt(PAD, y, 1, 1, trunc(`EXP: ${data.expiryDate}`, maxS)));
  }

  const safeCopies = Math.max(1, Math.min(99, Math.round(copies)));
  cmd.push(`PRINT ${safeCopies}`);

  return cmd.join('\n');
}
