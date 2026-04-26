'use client';

import { useState } from 'react';
import { Plus, Printer } from 'lucide-react';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
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
import { useCanEdit } from '@/hooks/auth/useAuth';
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

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    categoryId: categoryFilter || undefined,
  });

  const { data: categories = [] } = useCategories();
  const canEdit = useCanEdit();
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
    const allBarcodes = (formData.extraBarcodes ?? []).map((b) => b.value).filter((v) => v.trim().length > 0);
    const base = {
      name: formData.name,
      barcode: allBarcodes[0] || undefined,
      extraBarcodes: allBarcodes.slice(1),
      sku: formData.sku,
      categoryId: formData.categoryId,
      costPrice: formData.costPrice,
      sellPrice: formData.sellPrice,
      minStockLevel: formData.minStockLevel,
      expiryTracking: !!formData.expiryDate || (formData.expiryTracking ?? false),
      supplierId: formData.supplierId || undefined,
    };
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, dto: base as UpdateProductDto },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      const dto: CreateProductDto = { ...base, initialStock: formData.initialStock || undefined };
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
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Mahsulot qo&apos;shish
            </button>
          )}
        </>
      }
    >
      {isError && <ErrorState compact onRetry={refetch} />}

      {!isError && (
        <ScrollableTable
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Nom, SKU yoki barcode bo'yicha qidirish..."
          filters={
            <SearchableDropdown
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setPage(1); }}
              placeholder="Barcha kategoriyalar"
              searchable={categories.length >= 6}
              clearable
              className="min-w-[200px]"
            />
          }
          totalCount={data?.meta.total}
          isLoading={isLoading}
          pagination={data && data.meta.totalPages > 1 ? {
            page,
            pageSize: 20,
            total: data.meta.total,
            onPageChange: setPage,
            onPageSizeChange: () => {},
          } : undefined}
        >
          <ProductsTable
            products={data?.items ?? []}
            onEdit={canEdit ? handleOpenEdit : undefined}
            onDelete={canEdit ? (p) => setDeletingProduct(p) : undefined}
            onPrint={(p) => setPrintProducts([p])}
          />
        </ScrollableTable>
      )}

      {/* Product Form Modal */}
      {formOpen && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          isPending={isPendingForm}
          onSubmit={(data) => handleFormSubmit(data)}
          onClose={() => setFormOpen(false)}
          initialSupplierId={editingProduct?.productSuppliers?.[0]?.supplierId}
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
