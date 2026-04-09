'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserCircle,
  AlertTriangle,
  ShieldOff,
  TrendingUp,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { useCustomersList, useNasiyaSummary, useCreateCustomer } from '@/hooks/customers/useDebts';
import { useBranches } from '@/hooks/settings/useBranches';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { CustomerWithDebt } from '@/types/debt';
import type { CustomerGender } from '@/types/customer';

function StatusBadge({ customer }: { customer: CustomerWithDebt }) {
  if (customer.isBlocked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <ShieldOff className="h-3 w-3" />
        Bloklangan
      </span>
    );
  }
  if (customer.hasOverdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        <AlertTriangle className="h-3 w-3" />
        Muddati o'tgan
      </span>
    );
  }
  if (customer.debtBalance > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        Nasiyada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Toza
    </span>
  );
}

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

function CreateCustomerModal({ onClose }: { onClose: () => void }) {
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
          <h2 className="text-base font-semibold text-gray-900">Yangi xaridor</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {/* Asosiy ma'lumotlar */}
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Asosiy</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                To'liq ism <span className="text-red-500">*</span>
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
              <label className="mb-1 block text-xs font-medium text-gray-700">Tug'ilgan sana</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={set('birthDate')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Jins</label>
              <select
                value={form.gender}
                onChange={set('gender')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">— Tanlang —</option>
                <option value="MALE">Erkak</option>
                <option value="FEMALE">Ayol</option>
              </select>
            </div>
          </div>

          {/* Qo'shimcha */}
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Qo'shimcha</p>

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
                Nasiya limiti (so'm)
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
                <select
                  value={form.branchId}
                  onChange={set('branchId')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">— Tanlang —</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={branches.length > 0 ? 'col-span-2' : 'col-span-2'}>
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
              Bekor
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Saqlanmoqda...' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { data: customers, isLoading } = useCustomersList(search || undefined);
  const { data: summary } = useNasiyaSummary();

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {showCreate && <CreateCustomerModal onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Xaridorlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {customers ? `${customers.length} ta xaridor` : 'Yuklanmoqda...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Xaridor qo'shish
          </button>
          <Link
            href="/nasiya"
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            <TrendingUp className="h-4 w-4" />
            Nasiya boshqaruv
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Jami nasiya',
              value: formatPrice(summary.totalDebt),
              sub: `${summary.totalCustomers} ta xaridor`,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
            {
              label: "Muddati o'tgan",
              value: formatPrice(summary.overdueDebt),
              sub: `${summary.overdueCustomers} ta xaridor`,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: "Bu oy yig'ilgan",
              value: formatPrice(summary.collectedThisMonth),
              sub: "Jami to'lovlar",
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Nasiya xaridorlar',
              value: summary.totalCustomers.toString(),
              sub: `${summary.overdueCustomers} ta muddati o'tgan`,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={cn('rounded-xl border border-gray-100 p-4', card.bg)}
            >
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <p className={cn('mt-1 text-lg font-bold', card.color)}>{card.value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki telefon..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Xaridor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Telefon</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Filial</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Jami qarz</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Limit</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">So'nggi tashrif</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!customers || customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <UserCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    {search ? "Qidiruv bo'yicha natija topilmadi" : "Xaridorlar yo'q"}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={cn(
                      'transition hover:bg-gray-50',
                      customer.isBlocked && 'bg-red-50/40',
                      !customer.isBlocked && customer.hasOverdue && 'bg-yellow-50/30',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <span className="text-xs font-semibold text-gray-600">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-400">
                            {customer.totalPurchases} ta xarid · {customer.activeDebtsCount} ta qarz
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {customer.phone ? `+${customer.phone}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {customer.branch?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          customer.debtBalance > customer.debtLimit
                            ? 'text-red-600'
                            : customer.debtBalance > 0
                            ? 'text-orange-600'
                            : 'text-gray-500',
                        )}
                      >
                        {customer.debtBalance > 0 ? formatPrice(customer.debtBalance) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatPrice(customer.debtLimit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge customer={customer} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {customer.lastVisitAt
                        ? new Date(customer.lastVisitAt).toLocaleDateString('uz-UZ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Ko'rish
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
