'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, Plus, Trash2, Search } from 'lucide-react';
import { catalogApi } from '@/api/catalog.api';
import { useProducts } from '@/hooks/catalog/useProducts';
import { cn, formatPrice } from '@/lib/utils';
import type { BundleItem } from '@/types/catalog';

interface BundleSectionProps {
  productId: string;
}

const BUNDLE_KEY = (id: string) => ['bundle-components', id];

function useBundleComponents(productId: string) {
  return useQuery({
    queryKey: BUNDLE_KEY(productId),
    queryFn: () => catalogApi.getBundleComponents(productId),
    staleTime: 30_000,
  });
}

function useAddComponent(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { componentId: string; quantity: number }) =>
      catalogApi.addBundleComponent(productId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUNDLE_KEY(productId) });
      toast.success("Komponent qo'shildi");
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}

function useRemoveComponent(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (componentId: string) =>
      catalogApi.removeBundleComponent(productId, componentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUNDLE_KEY(productId) });
      toast.success("Komponent olib tashlandi");
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}

export function BundleSection({ productId }: BundleSectionProps) {
  const { data: components = [], isLoading } = useBundleComponents(productId);
  const { mutate: addComponent, isPending: isAdding } = useAddComponent(productId);
  const { mutate: removeComponent } = useRemoveComponent(productId);
  const [showPicker, setShowPicker] = useState(false);

  const totalPrice = components.reduce(
    (sum, c) => sum + (c.component?.sellPrice ?? 0) * c.quantity,
    0,
  );

  return (
    <div className="col-span-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">
            To&apos;plam (Bundle) komponentlari
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Qo&apos;shish
        </button>
      </div>

      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 flex-1 animate-pulse rounded-lg bg-blue-100" />
          ))}
        </div>
      ) : components.length === 0 ? (
        <p className="py-4 text-center text-xs text-blue-400">
          Bu mahsulot to&apos;plam emas. Komponent qo&apos;shsangiz avtomatik bundle bo&apos;ladi.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {components.map((item) => (
              <ComponentRow key={item.id} item={item} onRemove={removeComponent} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-2 text-xs">
            <span className="text-blue-600">{components.length} ta komponent</span>
            <span className="font-medium text-blue-900">
              Jami narx: {formatPrice(totalPrice)}
            </span>
          </div>
        </>
      )}

      {showPicker && (
        <ProductPicker
          excludeIds={[productId, ...components.map((c) => c.componentId)]}
          onSelect={(componentId, quantity) => {
            addComponent({ componentId, quantity });
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}

function ComponentRow({
  item,
  onRemove,
}: {
  item: BundleItem;
  onRemove: (componentId: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {item.component?.name ?? item.componentId}
        </p>
        {item.component?.sku && (
          <p className="text-xs text-gray-400">{item.component.sku}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{item.quantity} dona</span>
        {item.component && (
          <span className="text-xs text-gray-400">
            {formatPrice(item.component.sellPrice * item.quantity)}
          </span>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.componentId)}
          className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ProductPicker({
  excludeIds,
  onSelect,
  onClose,
  isAdding,
}: {
  excludeIds: string[];
  onSelect: (componentId: string, quantity: number) => void;
  onClose: () => void;
  isAdding: boolean;
}) {
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState(1);
  const { data } = useProducts({ search: search || undefined });
  const products = (data?.items ?? []).filter((p) => !excludeIds.includes(p.id));

  return (
    <div className="mt-3 rounded-lg border border-blue-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mahsulot nomi yoki SKU..."
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-300"
          autoFocus
        />
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Yopish
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto">
        {products.length === 0 ? (
          <p className="py-3 text-center text-xs text-gray-400">Mahsulot topilmadi</p>
        ) : (
          products.slice(0, 10).map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={isAdding}
              onClick={() => onSelect(p.id, qty)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-gray-50',
                isAdding && 'opacity-50',
              )}
            >
              <div>
                <span className="font-medium text-gray-900">{p.name}</span>
                {p.sku && <span className="ml-2 text-xs text-gray-400">{p.sku}</span>}
              </div>
              <span className="text-xs text-gray-500">{formatPrice(Number(p.sellPrice))}</span>
            </button>
          ))
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
        <label className="text-xs text-gray-500">Soni:</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </div>
    </div>
  );
}
