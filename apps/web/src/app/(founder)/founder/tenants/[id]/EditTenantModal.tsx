'use client';

import { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  isPending: boolean;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

// Editable tenant fields
export function EditTenantModal({ isOpen, onClose, onSave, isPending, tenant }: EditTenantModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [legalName, setLegalName] = useState('');
  const [inn, setInn] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(tenant.name);
      setSlug(tenant.slug);
      setLegalName('');
      setInn('');
      setPhone('');
      setAddress('');
    }
  }, [isOpen, tenant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = { name, slug };
    if (legalName) data.legalName = legalName;
    if (inn) data.inn = inn;
    if (phone) data.phone = phone;
    if (address) data.address = address;
    onSave(data);
  };

  if (!isOpen) return null;

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Редактирование тенанта</h2>
              <p className="text-sm text-gray-500">{tenant.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Название <span className="text-red-500">*</span>
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={cn(inputCls, 'font-mono')}
                required
              />
              <p className="text-xs text-gray-400">URL: raos.uz/{slug}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Юр. название</label>
              <input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="OOO Kosmetika Markaz"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">ИНН</label>
                <input
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  placeholder="123456789"
                  className={cn(inputCls, 'font-mono')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Телефон</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998901234567"
                  className={cn(inputCls, 'font-mono')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Адрес</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Toshkent, Yunusobod tumani"
                className={inputCls}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !slug.trim() || isPending}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition',
                'bg-violet-600 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
