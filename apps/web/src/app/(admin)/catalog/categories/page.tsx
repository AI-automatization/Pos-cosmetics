'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, FolderOpen, FolderX } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryForm } from './CategoryForm';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/catalog/useCategories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/catalog';

function buildTree(categories: Category[]): Category[] {
  const map = new Map<string, Category & { children: Category[] }>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

  const roots: Category[] = [];
  map.forEach((cat) => {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children!.push(cat);
    } else {
      roots.push(cat);
    }
  });
  return roots;
}

interface CategoryRowProps {
  category: Category;
  depth: number;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

function CategoryRow({ category, depth, onEdit, onDelete }: CategoryRowProps) {
  const hasChildren = (category.children?.length ?? 0) > 0;

  return (
    <>
      <tr className="transition hover:bg-gray-50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {hasChildren ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-blue-400" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            )}
            <span className="text-sm font-medium text-gray-900">{category.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {hasChildren ? `${category.children!.length} ta ichki kategoriya` : '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Tahrirlash"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="O'chirish"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

export default function CategoriesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const tree = buildTree(categories);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    const dto = {
      name: (data as CreateCategoryDto).name,
      parentId: (data as CreateCategoryDto).parentId || undefined,
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, dto },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createCategory.mutate(dto, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;
    deleteCategory.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  };

  const isPendingForm = createCategory.isPending || updateCategory.isPending;

  return (
    <PageLayout
      title="Kategoriyalar"
      subtitle={`Jami: ${categories.length} ta kategoriya`}
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Kategoriya qo'shish
        </button>
      }
    >
      {isLoading && <LoadingSkeleton variant="table" rows={5} />}

      {isError && <ErrorState compact onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {categories.length === 0 ? (
            <EmptyState icon={FolderX} title="Kategoriyalar mavjud emas" description="Birinchi kategoriyani qo'shing" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Kategoriya nomi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Ichki kategoriyalar
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tree.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      depth={0}
                      onEdit={handleOpenEdit}
                      onDelete={(c) => setDeletingCategory(c)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {formOpen && (
        <CategoryForm
          category={editingCategory}
          categories={categories}
          isPending={isPendingForm}
          onSubmit={handleFormSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingCategory}
        title="Kategoriyani o'chirish"
        message={`"${deletingCategory?.name}" kategoriyasini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        isPending={deleteCategory.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
      />
    </PageLayout>
  );
}
