'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useCreateSupplier } from '@/hooks/catalog/useSuppliers';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n-context';

interface Props {
  allProducts: { id: string; name: string }[];
  onCreated: (newSupplierId: string) => void;
  onClose: () => void;
}

export function NewSupplierModal({ allProducts, onCreated, onClose }: Props) {
  const { t } = useTranslation();
  const { mutate: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '+998', company: '', address: '' });
  const [supplierProductIds, setSupplierProductIds] = useState<string[]>([]);
  const [supplierProductSearch, setSupplierProductSearch] = useState('');

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      toast.error(t('warehouse.supplierNameRequired'));
      return;
    }
    createSupplier(
      {
        name: supplierForm.name.trim(),
        phone: supplierForm.phone || undefined,
        company: supplierForm.company || undefined,
        address: supplierForm.address || undefined,
      },
      {
        onSuccess: async (newSupplier) => {
          toast.success(t('warehouse.supplierCreated'));
          if (supplierProductIds.length > 0) {
            const { suppliersApi } = await import('@/api/suppliers.api');
            await Promise.all(supplierProductIds.map((pid) => suppliersApi.linkProduct(newSupplier.id, pid).catch(() => {})));
          }
          onCreated(newSupplier.id);
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{t('warehouse.newSupplier')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('warehouse.supplierName')} *</label>
            <input
              type="text"
              required
              value={supplierForm.name}
              onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('warehouse.phone')} *</label>
            <input
              type="text"
              required
              placeholder="+998XXXXXXXXX"
              value={supplierForm.phone}
              onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('warehouse.company')}</label>
              <input
                type="text"
                value={supplierForm.company}
                onChange={(e) => setSupplierForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('warehouse.address')}</label>
              <input
                type="text"
                value={supplierForm.address}
                onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Products section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('warehouse.goods')} <span className="text-xs font-normal text-gray-400">({t('common.optional')})</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={supplierProductSearch}
                onChange={(e) => setSupplierProductSearch(e.target.value)}
                placeholder={t('warehouse.productSearchPlaceholder')}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            {supplierProductSearch && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                {allProducts
                  .filter((p) => p.name.toLowerCase().includes(supplierProductSearch.toLowerCase()) && !supplierProductIds.includes(p.id))
                  .slice(0, 8)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSupplierProductIds((ids) => [...ids, p.id]); setSupplierProductSearch(''); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <Plus className="h-3 w-3 text-blue-500 shrink-0" />
                      {p.name}
                    </button>
                  ))}
              </div>
            )}
            {supplierProductIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {supplierProductIds.map((id) => {
                  const p = allProducts.find((x) => x.id === id);
                  return (
                    <span key={id} className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                      {p?.name ?? id}
                      <button type="button" onClick={() => setSupplierProductIds((ids) => ids.filter((i) => i !== id))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreatingSupplier}
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
            >
              {isCreatingSupplier ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
