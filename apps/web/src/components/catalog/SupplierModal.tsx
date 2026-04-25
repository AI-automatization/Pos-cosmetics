'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import {
  useCreateSupplier,
  useUpdateSupplier,
} from '@/hooks/catalog/useSuppliers';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/types/supplier';

const supplierSchema = z.object({
  name: z.string().min(2, 'Kamida 2 belgi'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
});
type SupplierForm = z.infer<typeof supplierSchema>;

interface SupplierModalProps {
  supplier?: Supplier;
  onClose: () => void;
}

export function SupplierModal({ supplier, onClose }: SupplierModalProps) {
  const { mutate: create, isPending: creating } = useCreateSupplier();
  const { mutate: update, isPending: updating } = useUpdateSupplier();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '+998',
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
