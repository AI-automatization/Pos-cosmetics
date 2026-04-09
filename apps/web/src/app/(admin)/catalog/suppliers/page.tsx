'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Building2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { SupplierModal } from '@/components/catalog/SupplierModal';
import { useSuppliers, useDeleteSupplier } from '@/hooks/catalog/useSuppliers';
import { useCanEdit } from '@/hooks/auth/useAuth';
import type { Supplier } from '@/types/supplier';

export default function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading, isError, refetch } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const canEdit = useCanEdit();

  const handleOpenCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditing(s);
    setModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    deleteSupplier.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <PageLayout
      title="Yetkazib beruvchilar"
      subtitle={`Jami: ${suppliers.length} ta`}
      actions={
        canEdit ? (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Qo&apos;shish
          </button>
        ) : undefined
      }
    >
      {isLoading && <LoadingSkeleton variant="table" rows={5} />}

      {isError && <ErrorState compact onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {suppliers.length === 0 ? (
            <EmptyState icon={Building2} title="Yetkazib beruvchilar mavjud emas" description="Birinchi yetkazib beruvchini qo'shing" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nomi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kompaniya</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Manzil</th>
                    {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amallar</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.company ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {s.company}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {s.phone}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{s.address ?? '—'}</td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(s)}
                              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(s)}
                              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <SupplierModal supplier={editing ?? undefined} onClose={() => setModalOpen(false)} />
      )}

      <ConfirmDialog
        isOpen={!!deleting}
        title="Yetkazib beruvchini o'chirish"
        message={`"${deleting?.name}" ni o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        isPending={deleteSupplier.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </PageLayout>
  );
}
