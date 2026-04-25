'use client';

import { useState } from 'react';
import type { UseFormRegister, UseFieldArrayReturn } from 'react-hook-form';
import { X, Plus, Barcode, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputCls } from './FormField';
import { BarcodeScanner } from '@/components/ui/BarcodeScanner';
import type { ProductFormData } from './ProductForm';

interface BarcodeFieldsProps {
  register: UseFormRegister<ProductFormData>;
  fields: UseFieldArrayReturn<ProductFormData, 'extraBarcodes'>['fields'];
  append: UseFieldArrayReturn<ProductFormData, 'extraBarcodes'>['append'];
  remove: UseFieldArrayReturn<ProductFormData, 'extraBarcodes'>['remove'];
  setValue: (name: `extraBarcodes.${number}.value`, value: string) => void;
}

export function BarcodeFields({ register, fields, append, remove, setValue }: BarcodeFieldsProps) {
  const [scanIndex, setScanIndex] = useState<number | null>(null);

  return (
    <div className="col-span-2">
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
          Barcode qo&apos;shish
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                {...register(`extraBarcodes.${index}.value`)}
                placeholder={`Barcode ${index + 1}`}
                className={cn(inputCls, 'flex-1')}
              />
              <button
                type="button"
                onClick={() => setScanIndex(index)}
                title="Kamera bilan skanerlash"
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
