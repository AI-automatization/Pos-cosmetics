'use client';

import { useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface LabelPrintModalProps {
  products: Product[];
  onClose: () => void;
}

export function LabelPrintModal({ products, onClose }: LabelPrintModalProps) {
  const [copies, setCopies] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1])),
  );
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Yorliq chop etish</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: monospace; background: #fff; }
            .labels { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; }
            .label {
              width: 60mm; height: 30mm;
              border: 1px solid #ccc;
              padding: 4px 6px;
              display: flex; flex-direction: column; justify-content: space-between;
              page-break-inside: avoid;
            }
            .label-name { font-size: 9pt; font-weight: bold; line-height: 1.2; max-height: 2.4em; overflow: hidden; }
            .label-sku { font-size: 7pt; color: #555; }
            .label-barcode { font-size: 8pt; letter-spacing: 2px; text-align: center; }
            .label-price { font-size: 11pt; font-weight: bold; text-align: right; }
            @page { margin: 5mm; }
          </style>
        </head>
        <body>
          <div class="labels">${printContents}</div>
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const labelElements = products.flatMap((p) => {
    const count = copies[p.id] ?? 1;
    return Array.from({ length: count }, (_, i) => (
      <div key={`${p.id}-${i}`} className="label">
        <div className="label-name">{p.name}</div>
        <div className="label-sku">SKU: {p.sku}</div>
        {p.barcode && <div className="label-barcode">|||  {p.barcode}  |||</div>}
        <div className="label-price">{formatPrice(p.sellPrice)}</div>
      </div>
    ));
  });

  const totalLabels = products.reduce((s, p) => s + (copies[p.id] ?? 1), 0);

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

        {/* Copies per product */}
        <div className="max-h-60 divide-y divide-gray-100 overflow-y-auto px-6 py-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{p.sku} · {formatPrice(p.sellPrice)}</p>
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

        {/* Preview area (hidden, used for print) */}
        <div className="mx-6 mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Ko&apos;rinish:</p>
          <div
            ref={printRef}
            className="flex flex-wrap gap-1"
            style={{ display: 'none' }}
          >
            {labelElements.map((el) => el)}
          </div>
          <div className="flex flex-wrap gap-2">
            {products.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded border border-gray-300 bg-white p-2"
                style={{ width: '140px', height: '70px' }}
              >
                <p className="line-clamp-1 text-xs font-bold leading-tight">{p.name}</p>
                <p className="text-[10px] text-gray-500">SKU: {p.sku}</p>
                {p.barcode && (
                  <p className="text-center font-mono text-[8px] tracking-widest">||| {p.barcode} |||</p>
                )}
                <p className="text-right text-xs font-bold">{formatPrice(p.sellPrice)}</p>
              </div>
            ))}
            {products.length > 3 && (
              <div className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-white text-xs text-gray-400"
                style={{ width: '80px', height: '70px' }}>
                +{products.length - 3} ta
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
