'use client';

import { useState, useEffect } from 'react';
import { Package, Search, AlertTriangle, TrendingDown, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/catalog/useProducts';
import { useCategories } from '@/hooks/catalog/useCategories';
import { ProductForm } from '@/app/(admin)/catalog/products/ProductForm';
import { LabelPrintModal } from '@/app/(admin)/catalog/products/LabelPrintModal';
import type { ProductFormData } from '@/app/(admin)/catalog/products/ProductForm';
import type { Product } from '@/types/catalog';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;
type SortCol = 'name' | 'stock' | 'min';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol; sortDir: SortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="inline ml-1 h-3 w-3 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="inline ml-1 h-3 w-3 text-amber-500" />
    : <ChevronDown className="inline ml-1 h-3 w-3 text-amber-500" />;
}

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [printProducts, setPrintProducts] = useState<Product[]>([]);

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

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

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

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortCol === 'name') return dir * a.name.localeCompare(b.name);
    if (sortCol === 'stock') return dir * ((a.currentStock ?? 0) - (b.currentStock ?? 0));
    if (sortCol === 'min') return dir * (a.minStockLevel - b.minStockLevel);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filter, sortCol]);

  const outCount = products.filter((p) => (p.currentStock ?? 0) <= 0).length;
  const lowCount = products.filter((p) => {
    const s = p.currentStock ?? 0;
    return s > 0 && p.minStockLevel > 0 && s <= p.minStockLevel;
  }).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
          <Package className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventar</h1>
          <p className="text-sm text-gray-500">Hozirgi zaxira holati</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-xs text-gray-500">Jami mahsulotlar</p>
            </div>
          </div>
        </div>
        <div className={cn('rounded-xl border p-4 shadow-sm', lowCount > 0 ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200 bg-white')}>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', lowCount > 0 ? 'bg-orange-100' : 'bg-gray-50')}>
              <TrendingDown className={cn('h-5 w-5', lowCount > 0 ? 'text-orange-500' : 'text-gray-400')} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowCount}</p>
              <p className="text-xs text-gray-500">Kam qolgan</p>
            </div>
          </div>
        </div>
        <div className={cn('rounded-xl border p-4 shadow-sm', outCount > 0 ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white')}>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', outCount > 0 ? 'bg-red-100' : 'bg-gray-50')}>
              <AlertTriangle className={cn('h-5 w-5', outCount > 0 ? 'text-red-500' : 'text-gray-400')} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outCount}</p>
              <p className="text-xs text-gray-500">Tugagan</p>
            </div>
          </div>
        </div>
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
        ) : sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            Ma&apos;lumot topilmadi
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                    <th
                      className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Mahsulot <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} />
                    </th>
                    <th className="px-4 py-3 text-left font-medium">SKU</th>
                    <th className="px-4 py-3 text-left font-medium">Kategoriya</th>
                    <th
                      className="px-4 py-3 text-right font-medium cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort('min')}
                    >
                      Min. zaxira <SortIcon col="min" sortCol={sortCol} sortDir={sortDir} />
                    </th>
                    <th
                      className="px-4 py-3 text-right font-medium cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort('stock')}
                    >
                      Hozirgi miqdor <SortIcon col="stock" sortCol={sortCol} sortDir={sortDir} />
                    </th>
                    <th className="px-4 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((p) => {
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
                              <><AlertTriangle className="h-3 w-3" /> Tugagan</>
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
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} / {sorted.length} ta
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <span className="px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
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

      {printProducts.length > 0 && (
        <LabelPrintModal
          products={printProducts}
          onClose={() => setPrintProducts([])}
        />
      )}
    </div>
  );
}
