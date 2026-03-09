'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Phone, Building2, X } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/catalog/useSuppliers';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/types/supplier';

const supplierSchema = z.object({
  name: z.string().min(2, 'Kamida 2 belgi'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
});
type SupplierForm = z.infer<typeof supplierSchema>;

function SupplierModal({
  supplier,
  onClose,
}: {
  supplier?: Supplier;
  onClose: () => void;
}) {
  const { mutate: create, isPending: creating } = useCreateSupplier();
  const { mutate: update, isPending: updating } = useUpdateSupplier();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '',
      company: supplier?.company ?? '',
      address: supplier?.address ?? '',
    },
  });

  const onSubmit = (data: SupplierForm) => {
    const dto: CreateSupplierDto = {
      name: data.name,
      phone: data.phone || undefined,
      company: data.company || undefined,
      address: data.address || undefined,
    };
    if (supplier) {
      update({ id: supplier.id, dto: dto as UpdateSupplierDto }, { onSuccess: onClose });
    } else {
      create(dto, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {supplier ? 'Yetkazib beruvchini tahrirlash' : "Yetkazib beruvchi qo'shish"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nomi <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Yetkazib beruvchi nomi"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
            <input
              {...register('phone')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+998 90 000 00 00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kompaniya</label>
            <input
              {...register('company')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Kompaniya nomi"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Manzil</label>
            <input
              {...register('address')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Shahar, ko'cha"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading, isError } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

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
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Qo&apos;shish
        </button>
      }
    >
      {isLoading && <LoadingSkeleton variant="table" rows={5} />}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Ma&apos;lumotlarni yuklashda xatolik yuz berdi.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <Building2 className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">Yetkazib beruvchilar mavjud emas</p>
              <p className="mt-1 text-xs text-gray-400">Birinchi yetkazib beruvchini qo&apos;shing</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nomi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kompaniya</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Manzil</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amallar</th>
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
