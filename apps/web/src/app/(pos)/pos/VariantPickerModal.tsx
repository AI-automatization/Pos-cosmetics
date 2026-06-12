'use client';

import { useQuery } from '@tanstack/react-query';
import { X, Tag } from 'lucide-react';
import { catalogApi } from '@/api/catalog.api';
import { useTranslation } from '@/i18n/i18n-context';
import type { Product, ProductVariant } from '@/types/catalog';

interface VariantPickerModalProps {
  product: Product;
  onSelect: (variant: ProductVariant) => void;
  onClose: () => void;
}

export function VariantPickerModal({ product, onSelect, onClose }: VariantPickerModalProps) {
  const { t } = useTranslation();
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['variants', product.id],
    queryFn: () => catalogApi.getVariants(product.id),
  });

  const activeVariants = variants.filter((v) => v.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500">{t('pos.selectVariant')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : activeVariants.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            {t('pos.noVariants')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {activeVariants.map((variant) => {
              const attrs = (variant.attributes ?? {}) as Record<string, string>;
              const attrEntries = Object.entries(attrs);
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onSelect(variant)}
                  className="flex flex-col items-start rounded-lg border border-gray-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 active:scale-[0.97]"
                >
                  <p className="text-sm font-medium text-gray-900">{variant.name}</p>
                  {attrEntries.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {attrEntries.map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1.5 text-sm font-semibold text-green-700">
                    {Number(variant.sellPrice).toLocaleString()} so&apos;m
                  </p>
                  {variant.sku && (
                    <p className="text-[10px] text-gray-400">{variant.sku}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
