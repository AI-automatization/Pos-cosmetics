// ─── Label sizes ─────────────────────────────────────────────────────────────
export const LABEL_SIZES = [
  { key: '30x20', label: '30x20 mm' },
  { key: '40x30', label: '40x30 mm' },
  { key: '58x40', label: '58x40 mm' },
] as const;

export type LabelSize = typeof LABEL_SIZES[number]['key'];

export const SIZE_DIMS: Record<LabelSize, { w: string; h: string; fontSize: string }> = {
  '30x20': { w: '30mm', h: '20mm', fontSize: '7pt' },
  '40x30': { w: '40mm', h: '30mm', fontSize: '8pt' },
  '58x40': { w: '58mm', h: '40mm', fontSize: '9pt' },
};

// ─── Print mode ──────────────────────────────────────────────────────────────
export type PrintMode = 'system' | 'bluetooth';

// ─── Constants ───────────────────────────────────────────────────────────────
export const MIN_COPIES     = 1;
export const MAX_COPIES     = 99;
export const DEFAULT_COPIES = 1;
export const DEFAULT_SIZE: LabelSize = '40x30';

// ─── Props ───────────────────────────────────────────────────────────────────
export interface LabelPrintSheetProps {
  readonly product: {
    readonly id: string;
    readonly name: string;
    readonly barcode?: string | null;
    readonly sellPrice: number;
    readonly sku?: string | null;
  } | null;
  readonly onClose: () => void;
}

// ─── HTML generator ──────────────────────────────────────────────────────────
export function buildLabelHtml(
  product: NonNullable<LabelPrintSheetProps['product']>,
  size: LabelSize,
  copies: number,
): string {
  const { w, h, fontSize } = SIZE_DIMS[size];
  const priceFormatted = product.sellPrice.toLocaleString('uz-UZ');

  const label = `
    <div style="
      width:${w};height:${h};border:1px solid #ccc;padding:2mm;
      font-family:monospace;display:flex;flex-direction:column;
      justify-content:space-between;page-break-inside:avoid;box-sizing:border-box;
    ">
      <div style="font-size:${fontSize};font-weight:bold;line-height:1.2;overflow:hidden">
        ${product.name}
      </div>
      ${product.sku ? `<div style="font-size:6pt;color:#555">SKU: ${product.sku}</div>` : ''}
      ${product.barcode ? `<div style="font-size:6pt;letter-spacing:1px">|||${product.barcode}|||</div>` : ''}
      <div style="font-size:${fontSize};font-weight:bold">${priceFormatted} so'm</div>
    </div>
  `;

  const labels = Array(copies).fill(label).join('');
  return `<html><body style="margin:0;display:flex;flex-wrap:wrap;gap:2mm;padding:2mm">${labels}</body></html>`;
}
