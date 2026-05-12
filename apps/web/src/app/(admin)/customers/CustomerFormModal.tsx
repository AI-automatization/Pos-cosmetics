'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateCustomer } from '@/hooks/customers/useDebts';
import { useBranches } from '@/hooks/settings/useBranches';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { CustomerGender } from '@/types/customer';

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  gender: CustomerGender | '';
  debtLimit: string;
  branchId: string;
  notes: string;
}

interface Props {
  onClose: () => void;
}

export function CustomerFormModal({ onClose }: Props) {
  const { t } = useTranslation();
  const { mutate: createCustomer, isPending } = useCreateCustomer();
  const { data: branches = [] } = useBranches();

  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    address: '',
    gender: '',
    debtLimit: '',
    branchId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerForm, string>>>({});

  const set = (field: keyof CustomerForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<Record<keyof CustomerForm, string>> = {};
    if (!form.name.trim()) e.name = 'Ism kiritilishi shart';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Email noto\'g\'ri formatda';
    if (form.debtLimit && isNaN(Number(form.debtLimit)))
      e.debtLimit = 'Son kiritilishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return undefined;
    return digits.startsWith('998') ? `+${digits}` : `+998${digits}`;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    createCustomer(
      {
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        email: form.email.trim() || undefined,
        birthDate: form.birthDate || undefined,
        address: form.address.trim() || undefined,
        gender: (form.gender as CustomerGender) || undefined,
        debtLimit: form.debtLimit ? Number(form.debtLimit) : undefined,
        notes: form.notes.trim() || undefined,
        branchId: form.branchId || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Yangi mijoz</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Asosiy</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                To&apos;liq ism <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Aziz Karimov"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-200',
                  errors.name ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="998901234567"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="aziz@example.com"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-200',
                  errors.email ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Tug&apos;ilgan sana</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={set('birthDate')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Jins</label>
              <SearchableDropdown
                options={[
                  { value: 'MALE', label: 'Erkak' },
                  { value: 'FEMALE', label: 'Ayol' },
                ]}
                value={form.gender}
                onChange={(val) => setForm((prev) => ({ ...prev, gender: val as CustomerGender | '' }))}
                placeholder="— Tanlang —"
                searchable={false}
                clearable
              />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Qo&apos;shimcha</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Manzil</label>
              <input
                type="text"
                value={form.address}
                onChange={set('address')}
                placeholder="Toshkent, Chilonzor tumani"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Nasiya limiti (so&apos;m)
              </label>
              <input
                type="number"
                value={form.debtLimit}
                onChange={set('debtLimit')}
                placeholder="500000"
                min={0}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-200',
                  errors.debtLimit ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.debtLimit && (
                <p className="mt-1 text-xs text-red-500">{errors.debtLimit}</p>
              )}
            </div>

            {branches.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Filial</label>
                <SearchableDropdown
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                  value={form.branchId}
                  onChange={(val) => setForm((prev) => ({ ...prev, branchId: val }))}
                  placeholder="— Filial tanlang —"
                  searchable={branches.length > 4}
                  clearable
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Izoh</label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Qo'shimcha ma'lumot (ixtiyoriy)"
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? t('common.saving') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
