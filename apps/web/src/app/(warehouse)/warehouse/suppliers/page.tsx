'use client';

import { useState } from 'react';
import { Truck, Search, Phone, Building2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { useSuppliers } from '@/hooks/catalog/useSuppliers';
import { cn } from '@/lib/utils';

export default function WarehouseSuppliersPage() {
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: suppliers = [], isLoading } = useSuppliers();

  const filtered = suppliers.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.phone ?? '').includes(search);

    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && s.isActive) ||
      (filterActive === 'inactive' && !s.isActive);

    return matchSearch && matchActive;
  });

  const activeCount = suppliers.filter((s) => s.isActive).length;

  return (
    <div className="p-6 space-y-5">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yetkazib beruvchilar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Barcha yetkazib beruvchilar ro'yxati</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Truck className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Jami:</span>
          <span className="font-semibold text-gray-900">{suppliers.length}</span>
          <span className="text-gray-400 mx-1">|</span>
          <span className="text-green-600 font-semibold">{activeCount} faol</span>
        </div>
      </div>

      {/* Filter va qidirish */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi, kompaniya yoki telefon..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition',
                filterActive === f
                  ? 'bg-amber-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {f === 'all' ? 'Barchasi' : f === 'active' ? 'Faol' : 'Faol emas'}
            </button>
          ))}
        </div>
      </div>

      {/* Kartalar ro'yxati */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-2 text-gray-400">
          <Truck className="h-10 w-10 text-gray-300" />
          <p className="text-sm">
            {search || filterActive !== 'all'
              ? "Qidiruv bo'yicha hech narsa topilmadi"
              : "Yetkazib beruvchilar hali qo'shilmagan"}
          </p>
          {!search && filterActive === 'all' && (
            <p className="text-xs text-gray-400 mt-1">
              Yetkazib beruvchilarni Katalog → Yetkazib beruvchilar sahifasida qo'shing
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplier) => (
            <div
              key={supplier.id}
              className={cn(
                'bg-white border rounded-xl p-4 space-y-3 transition',
                supplier.isActive
                  ? 'border-gray-200 hover:border-amber-300 hover:shadow-sm'
                  : 'border-gray-100 opacity-60',
              )}
            >
              {/* Sarlavha */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 leading-tight">{supplier.name}</h3>
                  {supplier.company && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                      <Building2 className="h-3 w-3" />
                      {supplier.company}
                    </div>
                  )}
                </div>
                {supplier.isActive ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
                )}
              </div>

              {/* Kontakt */}
              <div className="space-y-1.5">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <a href={`tel:${supplier.phone}`} className="hover:text-amber-600 transition">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
                {!supplier.phone && !supplier.address && (
                  <p className="text-xs text-gray-400">Kontakt ma'lumoti yo'q</p>
                )}
              </div>

              {/* Holat */}
              <div className="pt-1 border-t border-gray-100">
                <span
                  className={cn(
                    'text-xs font-medium',
                    supplier.isActive ? 'text-green-600' : 'text-gray-400',
                  )}
                >
                  {supplier.isActive ? 'Faol' : 'Faol emas'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
