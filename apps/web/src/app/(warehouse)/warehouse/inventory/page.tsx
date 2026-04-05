'use client';

import { useState } from 'react';
import { Package, Search, AlertTriangle, TrendingDown, Plus, Pencil } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/catalog/useProducts';
import { useCategories } from '@/hooks/catalog/useCategories';
import { ProductForm } from '@/app/(admin)/catalog/products/ProductForm';
import type { ProductFormData } from '@/app/(admin)/catalog/products/ProductForm';
import type { Product } from '@/types/catalog';
import { cn } from '@/lib/utils';

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts({ limit: 500, isActive: true });
  const products = Array.isArray(productsData) ? productsData : (productsData?.items ?? []);
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatingProduct } = useUpdateProduct();
  const { data: categories } = useCategories();

  const handleCreateProduct = (formData: ProductFormData) => {
    createProduct(
      {
        name: formData.name,
        sku: formData.sku || undefined,
        categoryId: formData.categoryId || undefined,
        costPrice: formData.costPrice,
        sellPrice: formData.sellPrice,
        minStockLevel: formData.minStockLevel,
        barcode: formData.barcode || undefined,
        extraBarcodes: formData.extraBarcodes?.map((b) => b.value).filter((v) => v.trim().length > 0),
        expiryTracking: !!formData.expiryDate || (formData.expiryTracking ?? false),
      },
      { onSuccess: () => setShowProductModal(false) },
    );
  };

  const handleUpdateProduct = (formData: ProductFormData) => {
    if (!editProduct) return;
    updateProduct(
      {
        id: editProduct.id,
        dto: {
          name: formData.name,
          sku: formData.sku || undefined,
          categoryId: formData.categoryId || undefined,
          costPrice: formData.costPrice,
          sellPrice: formData.sellPrice,
          minStockLevel: formData.minStockLevel,
          barcode: formData.barcode || undefined,
          extraBarcodes: formData.extraBarcodes?.map((b) => b.value).filter((v) => v.trim().length > 0),
          expiryTracking: !!formData.expiryDate || (formData.expiryTracking ?? false),
        },
      },
      { onSuccess: () => setEditProduct(null) },
    );
  };

  const filtered = products.filter((p) => {
    const stock = Math.max(0, p.currentStock ?? 0);
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? '').includes(search);

    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && stock > 0 && p.minStockLevel > 0 && stock <= p.minStockLevel) ||
      (filter === 'out' && stock <= 0);

    return matchSearch && matchFilter;
  });

  const outCount = products.filter((p) => (p.currentStock ?? 0) <= 0).length;
  const lowCount = products.filter((p) => {
    const s = p.currentStock ?? 0;
    return s > 0 && p.minStockLevel > 0 && s <= p.minStockLevel;
  }).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventar (Sklad)</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hozirgi zaxira holati</p>
        </div>
        <button
          type="button"
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
        >
          <Plus className="h-4 w-4" />
          Mahsulot qo&apos;shish
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Jami:</span>
          <span className="font-semibold text-gray-900">{products.length}</span>
        </div>
        {lowCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <span className="text-orange-700">Kam:</span>
            <span className="font-semibold text-orange-700">{lowCount}</span>
          </div>
        )}
        {outCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">Tugagan:</span>
            <span className="font-semibold text-red-700">{outCount}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nomi yoki SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition',
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {f === 'all' ? 'Barchasi' : f === 'low' ? 'Kam qoldi' : 'Tugagan'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            Ma&apos;lumot topilmadi
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Mahsulot</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-left font-medium">Kategoriya</th>
                <th className="px-4 py-3 text-right font-medium">Min. zaxira</th>
                <th className="px-4 py-3 text-right font-medium">Hozirgi miqdor</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const stock = Math.max(0, p.currentStock ?? 0);
                const isOut = stock <= 0;
                const isLow = !isOut && p.minStockLevel > 0 && stock <= p.minStockLevel;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-gray-400">{p.sku ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400">
                      {p.minStockLevel > 0 ? p.minStockLevel : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                          isOut
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700',
                        )}
                      >
                        {isOut ? (
                          <>
                            <AlertTriangle className="h-3 w-3" /> Tugagan
                          </>
                        ) : (
                          `${stock} ${p.unit?.shortName ?? 'dona'}`
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setEditProduct(p)}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition"
                        title="Tahrirlash"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showProductModal && (
        <ProductForm
          product={null}
          categories={categories ?? []}
          isPending={isCreatingProduct}
          onSubmit={handleCreateProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {editProduct && (
        <ProductForm
          product={editProduct}
          categories={categories ?? []}
          isPending={isUpdatingProduct}
          onSubmit={handleUpdateProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
}
