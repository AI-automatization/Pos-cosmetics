'use client';

import { useState } from 'react';
import { Plus, Filter, Printer } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProductsTable } from './ProductsTable';
import { ProductForm } from './ProductForm';
import { LabelPrintModal } from './LabelPrintModal';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/catalog/useProducts';
import { useCategories } from '@/hooks/catalog/useCategories';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/catalog';
import type { ProductFormData } from './ProductForm';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [printProducts, setPrintProducts] = useState<Product[]>([]);

  const { data, isLoading, isError } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    categoryId: categoryFilter || undefined,
  });

  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleFormSubmit = (formData: ProductFormData) => {
    // Map form data to backend DTO field names
    const dto: CreateProductDto = {
      name: formData.name,
      barcode: formData.barcode || undefined,
      sku: formData.sku,
      categoryId: formData.categoryId,
      costPrice: formData.costPrice,
      sellPrice: formData.sellPrice,
      minStockLevel: formData.minStockLevel,
    };
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, dto: dto as UpdateProductDto },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createProduct.mutate(dto, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
    });
  };

  const isPendingForm = createProduct.isPending || updateProduct.isPending;

  return (
    <PageLayout
      title="Mahsulotlar"
      subtitle={data ? `Jami: ${data.meta.total} ta mahsulot` : undefined}
      actions={
        <>
          {data && data.items.length > 0 && (
            <button
              type="button"
              onClick={() => setPrintProducts(data.items)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Yorliqlar
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Mahsulot qo&apos;shish
          </button>
        </>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Nom, SKU yoki barcode bo'yicha qidirish..."
          className="sm:w-80"
        />

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton variant="table" rows={8} />}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Ma'lumotlarni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.
        </div>
      )}

      {data && (
        <>
          <ProductsTable
            products={data.items}
            onEdit={handleOpenEdit}
            onDelete={(p) => setDeletingProduct(p)}
            onPrint={(p) => setPrintProducts([p])}
          />

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} / {data.meta.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Oldingi
                </button>
                <span className="px-2 font-medium">
                  {page} / {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === data.meta.totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
                >
                  Keyingi →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      {formOpen && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          isPending={isPendingForm}
          onSubmit={(data) => handleFormSubmit(data)}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        title="Mahsulotni o'chirish"
        message={`"${deletingProduct?.name}" mahsulotini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        isPending={deleteProduct.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
      />

      {/* Label Print Modal */}
      {printProducts.length > 0 && (
        <LabelPrintModal
          products={printProducts}
          onClose={() => setPrintProducts([])}
        />
      )}
    </PageLayout>
  );
}
