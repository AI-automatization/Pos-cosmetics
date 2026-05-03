'use client';

import { useState, useEffect } from 'react';
import { FlaskConical, Save, X } from 'lucide-react';
import { useOpenTester } from '@/hooks/inventory/useInventory';
import { useProducts } from '@/hooks/catalog/useProducts';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory.api';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';

interface TesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TesterModal({ isOpen, onClose }: TesterModalProps) {
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.items ?? [];

  const { data: warehouses = [] } = useQuery({
    queryKey: ['inventory', 'warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
    staleTime: 60_000,
  });

  const { mutate: openTester, isPending } = useOpenTester();

  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [note, setNote] = useState('');

  // Auto-select first warehouse
  useEffect(() => {
    if (warehouses.length === 1 && !warehouseId) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouses, warehouseId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProductId('');
      setQuantity(1);
      setCostPrice(0);
      setNote('');
      if (warehouses.length === 1) setWarehouseId(warehouses[0].id);
      else setWarehouseId('');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = productId && warehouseId && quantity > 0 && costPrice >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    openTester(
      { productId, warehouseId, quantity, costPrice, note: note.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="relative flex h-full w-full flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tester ochish</h2>
              <p className="text-sm text-gray-500">Tester/namuna sifatida chiqarish</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-5 p-6">
            {/* Product */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mahsulot <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: p.barcode || p.sku || undefined,
                }))}
                value={productId}
                onChange={(val) => setProductId(val)}
                placeholder="Mahsulot tanlang..."
                searchPlaceholder="Nomi yoki barcode..."
                clearable={false}
                required
              />
            </div>

            {/* Warehouse (show only if multiple) */}
            {warehouses.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Ombor <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  value={warehouseId}
                  onChange={(val) => setWarehouseId(val)}
                  placeholder="Ombor tanlang..."
                  clearable={false}
                  required
                />
              </div>
            )}

            {/* Quantity + Cost Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Miqdor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0.001}
                  step={0.001}
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  required
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tan narxi (so&apos;m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  required
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Total cost preview */}
            {quantity > 0 && costPrice > 0 && (
              <div className="rounded-lg bg-purple-50 px-4 py-3 text-sm">
                <span className="text-purple-700">
                  Jami xarajat:{' '}
                  <span className="font-semibold">
                    {(quantity * costPrice).toLocaleString('uz-UZ')} so&apos;m
                  </span>
                </span>
                <p className="mt-0.5 text-xs text-purple-500">
                  Bu summa xarajatlar jurnalida TESTER kategoriyasida saqlanadi
                </p>
              </div>
            )}

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Izoh (ixtiyoriy)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masalan: Mijoz uchun namuna..."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition',
                'bg-purple-600 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Saqlanmoqda...' : 'Testerni saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
