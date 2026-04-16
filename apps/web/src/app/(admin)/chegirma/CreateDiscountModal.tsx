'use client';

import { useState } from 'react';
import { X, Tag, Percent, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { formatPrice } from '@/lib/utils';

interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface CreateDiscountModalProps {
  onClose: () => void;
  products: DemoProduct[];
}

export function CreateDiscountModal({ onClose, products }: CreateDiscountModalProps) {
  const [productId, setProductId] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    description: p.category,
    meta: formatPrice(p.price),
  }));

  const selectedProduct = products.find((p) => p.id === productId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo: just close the modal
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="modal-backdrop absolute inset-0" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Tag className="h-4 w-4 text-violet-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Yangi chegirma</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 px-6 py-5">
            {/* Product select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mahsulot <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={productOptions}
                value={productId}
                onChange={setProductId}
                placeholder="Mahsulot tanlang..."
                searchPlaceholder="Mahsulot qidirish..."
              />
              {selectedProduct && (
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100">
                    <Tag className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-violet-800">{selectedProduct.name}</p>
                    <p className="text-xs text-violet-500">{selectedProduct.category} · {formatPrice(selectedProduct.price)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Discount type toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Chegirma turi</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition',
                    discountType === 'percent'
                      ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50',
                  )}
                >
                  <Percent className="h-4 w-4" />
                  Foiz (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition',
                    discountType === 'fixed'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50',
                  )}
                >
                  <DollarSign className="h-4 w-4" />
                  Miqdor (So'm)
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Chegirma miqdori <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={discountType === 'percent' ? '0–100' : '10 000'}
                  min={0}
                  max={discountType === 'percent' ? 100 : undefined}
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-3.5 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  {discountType === 'percent' ? '%' : "so'm"}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Boshlanish sanasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tugash sanasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tavsif{' '}
                <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masalan: Bahorgi aksiya"
                rows={2}
                className="w-full resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
