'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { UseFormRegister, UseFieldArrayReturn } from 'react-hook-form';
import { X, Plus, Barcode, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputCls } from './FormField';
import { BarcodeScanner } from '@/components/ui/BarcodeScanner';
import { useTranslation } from '@/i18n/i18n-context';
import { toast } from 'sonner';
import type { ProductFormData } from './ProductForm';

interface BarcodeFieldsProps {
  register: UseFormRegister<ProductFormData>;
  fields: UseFieldArrayReturn<ProductFormData, 'extraBarcodes'>['fields'];
  append: UseFieldArrayReturn<ProductFormData, 'extraBarcodes'>['append'];
  remove: UseFieldArrayReturn<ProductFormData, 'extraBarcodes'>['remove'];
  setValue: (name: `extraBarcodes.${number}.value`, value: string) => void;
  getValues?: () => ProductFormData;
  className?: string;
}

export function BarcodeFields({ register, fields, append, remove, setValue, getValues, className }: BarcodeFieldsProps) {
  const { t } = useTranslation();
  const [scanIndex, setScanIndex] = useState<number | null>(null);

  // USB/Bluetooth сканер: перехватывает быстрый ввод из ЛЮБОГО input
  const scanBufRef = useRef('');
  const scanTimeRef = useRef(0);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHardwareScan = useCallback((code: string) => {
    const current = getValues?.()?.extraBarcodes ?? [];
    if (current.some((b) => b.value === code)) {
      toast.warning(`Barcode ${code} allaqachon qo'shilgan`);
      return;
    }
    const emptyIdx = current.findIndex((b) => !b.value);
    if (emptyIdx >= 0) {
      setValue(`extraBarcodes.${emptyIdx}.value`, code);
    } else {
      append({ value: code });
    }
    toast.success(`Barcode qo'shildi: ${code}`);
  }, [append, setValue, getValues]);

  useEffect(() => {
    const MAX_DELAY = 80;
    const MIN_LEN = 4;

    function onKeyDown(e: KeyboardEvent) {
      // Если фокус в barcode-поле — пользователь вводит вручную, не перехватываем
      const el = document.activeElement as HTMLElement | null;
      if (el?.hasAttribute('data-barcode-field')) return;

      const now = Date.now();
      const gap = now - scanTimeRef.current;
      scanTimeRef.current = now;

      if (e.key === 'Enter') {
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        const code = scanBufRef.current.trim();
        if (code.length >= MIN_LEN) {
          e.preventDefault();
          // Очищаем текст который сканер "напечатал" в активный input
          if (el?.tagName === 'INPUT') {
            (el as HTMLInputElement).value = (el as HTMLInputElement).value.replace(code, '');
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
          handleHardwareScan(code);
        }
        scanBufRef.current = '';
        return;
      }

      if (gap > MAX_DELAY && scanBufRef.current.length > 0) {
        scanBufRef.current = '';
      }

      if (e.key.length === 1) {
        scanBufRef.current += e.key;
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        scanTimerRef.current = setTimeout(() => {
          scanBufRef.current = '';
        }, 200);
      }
    }

    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, [handleHardwareScan]);

  return (
    <div className={cn('col-span-2', className)}>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Barcode(lar)
        </label>
        <button
          type="button"
          onClick={() => append({ value: '' })}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Qo&apos;shish
        </button>
      </div>

      {fields.length === 0 ? (
        <button
          type="button"
          onClick={() => append({ value: '' })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-400 transition hover:border-blue-400 hover:text-blue-500"
        >
          <Barcode className="h-4 w-4" />
          {t('products.addBarcode')}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                {...register(`extraBarcodes.${index}.value`)}
                placeholder={`Barcode ${index + 1}`}
                data-barcode-field="true"
                className={cn(inputCls, 'flex-1')}
              />
              <button
                type="button"
                onClick={() => setScanIndex(index)}
                title={t('products.scanWithCamera')}
                className="rounded-lg border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-50 hover:border-gray-400"
              >
                <ScanLine className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {scanIndex !== null && (
        <BarcodeScanner
          onScan={(code) => {
            setValue(`extraBarcodes.${scanIndex}.value`, code);
            setScanIndex(null);
          }}
          onClose={() => setScanIndex(null)}
        />
      )}
    </div>
  );
}
