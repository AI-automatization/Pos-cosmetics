'use client';

import { useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface LabelPrintModalProps {
  products: Product[];
  onClose: () => void;
}

type LabelSize = '30x20' | '40x30' | '58x40';

const LABEL_SIZES: { value: LabelSize; label: string; w: string; h: string; wPx: number; hPx: number }[] = [
  { value: '30x20', label: '30×20 mm', w: '30mm', h: '20mm', wPx: 100, hPx: 56 },
  { value: '40x30', label: '40×30 mm', w: '40mm', h: '30mm', wPx: 130, hPx: 76 },
  { value: '58x40', label: '58×40 mm', w: '58mm', h: '40mm', wPx: 180, hPx: 100 },
];

function fmtExpiry(d?: string | null) {
  if (!d) return null;
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function buildPrintHtml(
  products: Product[],
  copies: Record<string, number>,
  size: LabelSize,
) {
  const cfg = LABEL_SIZES.find((s) => s.value === size)!;
  const isSmall = size === '30x20';

  const labels = products.flatMap((p) => {
    const count = copies[p.id] ?? 1;
    const expiry = fmtExpiry(p.expiryDate);
    return Array.from({ length: count }, () => {
      return `<div class="label">
        <div class="label-name">${p.name}</div>
        ${!isSmall ? `<div class="label-sku">SKU: ${p.sku ?? '—'}</div>` : ''}
        ${p.barcode ? `<div class="label-barcode">|||  ${p.barcode}  |||</div>` : ''}
        <div class="label-bottom">
          <div class="label-price">${formatPrice(Number(p.sellPrice))}</div>
          ${expiry ? `<div class="label-expiry">Muddat: ${expiry}</div>` : ''}
        </div>
      </div>`;
    });
  });

  const nameFontSize = isSmall ? '7pt' : size === '40x30' ? '8pt' : '9pt';
  const priceFontSize = isSmall ? '9pt' : size === '40x30' ? '10pt' : '11pt';
  const smallFontSize = isSmall ? '5.5pt' : '7pt';

  return `<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; background: #fff; }
  .labels { display: flex; flex-wrap: wrap; gap: 2mm; padding: 3mm; }
  .label {
    width: ${cfg.w}; height: ${cfg.h};
    border: 0.5px solid #ccc;
    padding: ${isSmall ? '1.5mm 2mm' : '2mm 3mm'};
    display: flex; flex-direction: column; justify-content: space-between;
    page-break-inside: avoid;
    overflow: hidden;
  }
  .label-name { font-size: ${nameFontSize}; font-weight: bold; line-height: 1.2; max-height: 2.4em; overflow: hidden; }
  .label-sku { font-size: ${smallFontSize}; color: #555; }
  .label-barcode { font-size: ${isSmall ? '6pt' : '7pt'}; letter-spacing: 1.5px; text-align: center; }
  .label-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
  .label-price { font-size: ${priceFontSize}; font-weight: bold; }
  .label-expiry { font-size: ${smallFontSize}; color: #666; }
  @page { margin: 3mm; }
</style>
</head>
<body>
  <div class="labels">${labels.join('')}</div>
  <script>window.onload = function() { window.print(); window.close(); }<\/script>
</body>
</html>`;
}

export function LabelPrintModal({ products, onClose }: LabelPrintModalProps) {
  const [copies, setCopies] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1])),
  );
  const [labelSize, setLabelSize] = useState<LabelSize>('40x30');

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(buildPrintHtml(products, copies, labelSize));
    win.document.close();
  };

  const totalLabels = products.reduce((s, p) => s + (copies[p.id] ?? 1), 0);
  const cfg = LABEL_SIZES.find((s) => s.value === labelSize)!;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Yorliq chop etish</h2>
            <p className="text-xs text-gray-500">{products.length} ta mahsulot · {totalLabels} ta yorliq</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Label size selector */}
        <div className="border-b border-gray-100 px-6 py-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Yorliq o&apos;lchami</p>
          <div className="flex gap-2">
            {LABEL_SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setLabelSize(s.value)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
                  labelSize === s.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Copies per product */}
        <div className="max-h-60 divide-y divide-gray-100 overflow-y-auto px-6 py-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">
                  {p.sku} · {formatPrice(Number(p.sellPrice))}
                  {p.expiryDate && ` · Muddat: ${fmtExpiry(p.expiryDate)}`}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <label className="text-xs text-gray-500">Nusxa:</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={copies[p.id] ?? 1}
                  onChange={(e) =>
                    setCopies((prev) => ({
                      ...prev,
                      [p.id]: Math.max(1, Math.min(99, Number(e.target.value))),
                    }))
                  }
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mx-6 mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Ko&apos;rinish ({cfg.label}):</p>
          <div className="flex flex-wrap gap-2">
            {products.slice(0, 4).map((p) => {
              const expiry = fmtExpiry(p.expiryDate);
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded border border-gray-300 bg-white p-1.5"
                  style={{ width: `${cfg.wPx}px`, height: `${cfg.hPx}px` }}
                >
                  <p className="line-clamp-1 text-[8px] font-bold leading-tight">{p.name}</p>
                  {labelSize !== '30x20' && (
                    <p className="text-[6px] text-gray-500">SKU: {p.sku}</p>
                  )}
                  {p.barcode && (
                    <p className="text-center font-mono text-[6px] tracking-widest">||| {p.barcode} |||</p>
                  )}
                  <div className="flex items-end justify-between">
                    <span className="text-[9px] font-bold">{formatPrice(Number(p.sellPrice))}</span>
                    {expiry && <span className="text-[5px] text-gray-500">{expiry}</span>}
                  </div>
                </div>
              );
            })}
            {products.length > 4 && (
              <div
                className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-white text-xs text-gray-400"
                style={{ width: `${cfg.wPx * 0.6}px`, height: `${cfg.hPx}px` }}
              >
                +{products.length - 4} ta
              </div>
            )}
          </div>
        </div>

        {/* Print button */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            Chop etish ({totalLabels} ta)
          </button>
        </div>
      </div>
    </div>
  );
}
