'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Search, UserPlus, AlertTriangle, CheckCircle, Phone, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchCustomer, useCreateCustomer } from '@/hooks/customers/useCustomer';
import { formatPrice, cn } from '@/lib/utils';
import type { Customer } from '@/types/customer';

interface CustomerSearchModalProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

const createSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 harf'),
  phone: z.string().min(9, 'Telefon raqam noto\'g\'ri'),
});
type CreateForm = z.infer<typeof createSchema>;

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`;
}

function CustomerCard({
  customer,
  onSelect,
}: {
  customer: Customer;
  onSelect: () => void;
}) {
  const isBlocked = customer.isBlocked;
  const hasOverdue = customer.hasOverdue;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition',
        isBlocked
          ? 'border-red-200 bg-red-50'
          : hasOverdue
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-green-200 bg-green-50',
      )}
    >
      {/* Customer info */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{customer.name}</p>
          <p className="text-sm text-gray-500">{customer.phone ? `+${customer.phone}` : '—'}</p>
        </div>
        {hasOverdue && !isBlocked && (
          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
            <AlertTriangle className="h-3 w-3" />
            Muddati o'tgan
          </span>
        )}
        {isBlocked && (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3 w-3" />
            Bloklangan
          </span>
        )}
      </div>

      {/* Debt info */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-white/70 px-3 py-2">
          <p className="text-xs text-gray-500">Joriy qarz</p>
          <p className={cn('font-bold', customer.debtBalance > 0 ? 'text-red-600' : 'text-gray-700')}>
            {formatPrice(customer.debtBalance)}
          </p>
        </div>
        <div className="rounded-lg bg-white/70 px-3 py-2">
          <p className="text-xs text-gray-500">Qarz limiti</p>
          <p className="font-bold text-gray-700">{formatPrice(customer.debtLimit)}</p>
        </div>
        {hasOverdue && (
          <div className="col-span-2 rounded-lg bg-yellow-100 px-3 py-2">
            <p className="text-xs text-yellow-700">
              <span className="font-semibold">Muddati o'tgan qarz: </span>
              {formatPrice(customer.overdueAmount)}
            </p>
          </div>
        )}
      </div>

      {/* Warnings */}
      {isBlocked && (
        <div className="mb-3 rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-xs text-red-700">
          Bu xaridor yangi nasiyadan bloklangan. Admin bilan bog'laning.
        </div>
      )}
      {hasOverdue && !isBlocked && (
        <div className="mb-3 rounded-lg border border-yellow-300 bg-yellow-100 px-3 py-2 text-xs text-yellow-700">
          Bu xaridorning muddati o'tgan qarzi bor. Ehtiyot bo'ling!
        </div>
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={isBlocked}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition',
          isBlocked
            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
        )}
      >
        <CheckCircle className="h-4 w-4" />
        {isBlocked ? 'Nasiya taqiqlangan' : 'Ushbu xaridorni tanlash'}
      </button>
    </div>
  );
}

export function CustomerSearchModal({ onSelect, onClose }: CustomerSearchModalProps) {
  const [phone, setPhone] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  const cleanPhone = phone.replace(/\D/g, '');
  const { data: foundCustomer, isLoading } = useSearchCustomer(cleanPhone);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { phone: '' },
  });

  const createCustomer = useCreateCustomer((customer) => {
    onSelect(customer);
    onClose();
  });

  // Focus on phone input on mount
  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  // When phone reaches 9+ digits and no customer found, offer create
  const shouldShowCreate = cleanPhone.length >= 9 && !isLoading && foundCustomer === null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPhone(raw);
    setValue('phone', raw);
    setShowCreate(false);
  };

  const onCreateSubmit = (data: CreateForm) => {
    const fullPhone = cleanPhone.startsWith('998') ? `+${cleanPhone}` : `+998${cleanPhone}`;
    createCustomer.mutate({ name: data.name, phone: fullPhone });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Xaridor tanlash</h2>
            <p className="text-xs text-gray-400">Telefon raqam orqali qidirish</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Phone search input */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              <Phone className="mr-1 inline h-3.5 w-3.5" />
              Telefon raqam
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                +998
              </span>
              <input
                ref={phoneRef}
                type="tel"
                value={formatPhone(phone)}
                onChange={handlePhoneChange}
                placeholder="90 123-45-67"
                className="w-full rounded-xl border border-gray-200 py-3 pl-14 pr-10 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
            </div>
          </div>

          {/* Loading */}
          {isLoading && cleanPhone.length >= 9 && (
            <div className="flex items-center justify-center py-6 text-sm text-gray-400">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              Qidirilmoqda...
            </div>
          )}

          {/* Found customer */}
          {!isLoading && foundCustomer && (
            <CustomerCard
              customer={foundCustomer}
              onSelect={() => {
                onSelect(foundCustomer);
                onClose();
              }}
            />
          )}

          {/* Not found — offer create */}
          {shouldShowCreate && !showCreate && (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center">
              <p className="mb-1 text-sm text-gray-500">
                +998 {formatPhone(cleanPhone)} raqamli xaridor topilmadi
              </p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 mx-auto mt-2"
              >
                <UserPlus className="h-4 w-4" />
                Yangi xaridor yaratish
              </button>
            </div>
          )}

          {/* Quick create form */}
          {shouldShowCreate && showCreate && (
            <form
              onSubmit={handleSubmit(onCreateSubmit)}
              className="rounded-xl border border-blue-200 bg-blue-50 p-4"
            >
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-blue-800">
                <UserPlus className="h-4 w-4" />
                Yangi xaridor
              </p>

              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  <User className="mr-1 inline h-3 w-3" />
                  Ismi *
                </label>
                <input
                  {...register('name')}
                  autoFocus
                  placeholder="Masalan: Aziz Karimov"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  <Phone className="mr-1 inline h-3 w-3" />
                  Telefon
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <span className="text-sm text-gray-400">+998</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPhone(cleanPhone)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {createCustomer.isPending ? 'Saqlanmoqda...' : "Qo'shish"}
                </button>
              </div>
            </form>
          )}

          {/* Initial hint */}
          {cleanPhone.length < 9 && (
            <p className="text-center text-xs text-gray-400">
              Telefon raqamni kiriting — xaridor avtomatik qidiriladi
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
