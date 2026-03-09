'use client';

import { useState } from 'react';
import { Download, FileText, Package, Users, BarChart2, Wallet } from 'lucide-react';
import { reportsApi } from '@/api/reports.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ExportType = 'sales' | 'order-items' | 'products' | 'inventory' | 'customers' | 'debts';

interface ExportItem {
  key: ExportType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const EXPORT_ITEMS: ExportItem[] = [
  {
    key: 'sales',
    label: 'Sotuvlar',
    description: "Barcha buyurtmalar ro'yxati",
    icon: BarChart2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'order-items',
    label: 'Buyurtma elementlari',
    description: 'Har bir mahsulot pozitsiyasi',
    icon: FileText,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    key: 'products',
    label: 'Mahsulotlar',
    description: "Katalog to'liq eksport",
    icon: Package,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    key: 'inventory',
    label: 'Inventar',
    description: 'Zaxira va harakatlar',
    icon: Package,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    key: 'customers',
    label: 'Xaridorlar',
    description: 'Xaridorlar bazasi',
    icon: Users,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    key: 'debts',
    label: 'Nasiyalar',
    description: "Barcha qarzlar tarixi",
    icon: Wallet,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
];

export default function ExportPage() {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleExport = async (key: ExportType) => {
    setLoading(key);
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    try {
      await reportsApi.exportDownload(key, params);
      toast.success(`${key} eksport qilindi!`);
    } catch {
      toast.error('Eksport xatosi');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Ma&apos;lumotlarni eksport qilish</h1>
        <p className="mt-0.5 text-sm text-gray-500">CSV formatida yuklab olish</p>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Boshlanish sanasi</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Tugash sanasi</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <p className="pb-2 text-xs text-gray-400">Sana tanlanmasa — barcha ma&apos;lumotlar</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className={cn('rounded-xl p-3', item.bg)}>
                <item.icon className={cn('h-5 w-5', item.color)} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleExport(item.key)}
              disabled={loading === item.key}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition',
                'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60',
              )}
            >
              <Download className="h-4 w-4" />
              {loading === item.key ? 'Yuklanmoqda...' : 'CSV yuklab olish'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
