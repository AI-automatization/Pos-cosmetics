'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { GitCompare, ArrowUpDown } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

// ─── Demo data ────────────────────────────────────────────────────────────────

interface BranchStat {
  id: string;
  name: string;
  city: string;
  orders: number;
  revenue: number;
  cogs: number;
  expenses: number;
  profit: number;
  avgCheck: number;
  cashiers: number;
  topProduct: string;
}

const BRANCHES: BranchStat[] = [
  {
    id: 'b-1', name: 'Chilonzor filiali', city: 'Toshkent',
    orders: 312, revenue: 14_250_000, cogs: 8_700_000, expenses: 2_500_000,
    profit: 3_050_000, avgCheck: 45_673, cashiers: 3, topProduct: 'Nivea Krem 150ml',
  },
  {
    id: 'b-2', name: 'Yunusobod filiali', city: 'Toshkent',
    orders: 248, revenue: 11_800_000, cogs: 7_200_000, expenses: 2_200_000,
    profit: 2_400_000, avgCheck: 47_580, cashiers: 2, topProduct: 'Maybelline Pomada',
  },
  {
    id: 'b-3', name: 'Sergeli filiali', city: 'Toshkent',
    orders: 186, revenue: 7_950_000, cogs: 4_900_000, expenses: 1_800_000,
    profit: 1_250_000, avgCheck: 42_742, cashiers: 2, topProduct: 'Dove Dezodorant',
  },
];

// 7 kunlik trend
const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
});

const WEEKLY = days.map((date, i) => ({
  date,
  'Chilonzor': Math.round(1_500_000 + Math.sin(i) * 300_000 + Math.random() * 200_000),
  'Yunusobod': Math.round(1_200_000 + Math.sin(i + 1) * 250_000 + Math.random() * 150_000),
  'Sergeli':   Math.round(800_000 + Math.sin(i + 2) * 200_000 + Math.random() * 100_000),
}));

const TRANSFERS = [
  { id: 'tr-1', from: 'Chilonzor', to: 'Sergeli', product: 'Nivea Krem 150ml', qty: 20, date: '2026-02-28', status: 'RECEIVED' },
  { id: 'tr-2', from: 'Yunusobod', to: 'Sergeli', product: 'Garnier Toner', qty: 15, date: '2026-03-01', status: 'SHIPPED' },
  { id: 'tr-3', from: 'Chilonzor', to: 'Yunusobod', product: 'Maybelline Pomada', qty: 10, date: '2026-03-02', status: 'PENDING' },
];

const TRANSFER_STATUS: Record<string, { label: string; className: string }> = {
  RECEIVED: { label: 'Qabul qilindi', className: 'bg-green-100 text-green-700' },
  SHIPPED:  { label: 'Yo\'lda', className: 'bg-blue-100 text-blue-700' },
  PENDING:  { label: 'Kutilmoqda', className: 'bg-yellow-100 text-yellow-700' },
};

const BRANCH_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b'];

// ─── Sort helper ──────────────────────────────────────────────────────────────

type SortKey = keyof Pick<BranchStat, 'revenue' | 'orders' | 'profit' | 'avgCheck'>;

export default function BranchReportsPage() {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');

  const sorted = [...BRANCHES].sort((a, b) => b[sortKey] - a[sortKey]);

  const totalRevenue = BRANCHES.reduce((s, b) => s + b.revenue, 0);
  const totalOrders  = BRANCHES.reduce((s, b) => s + b.orders, 0);
  const totalProfit  = BRANCHES.reduce((s, b) => s + b.profit, 0);


  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Filiallar taqqoslama</h1>
        <p className="mt-0.5 text-sm text-gray-500">{BRANCHES.length} ta filial · Oylik ko'rsatkichlar</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami daromad', value: formatPrice(totalRevenue), note: 'barcha filiallar' },
          { label: 'Jami buyurtmalar', value: `${totalOrders} ta`, note: 'bu oy' },
          { label: 'Jami foyda', value: formatPrice(totalProfit), note: 'xarajatlardan keyin' },
        ].map(({ label, value, note }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400">{note}</p>
          </div>
        ))}
      </div>

      {/* 7-kunlik trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">7 kunlik daromad taqqoslama</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={WEEKLY} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => formatPrice(Number(v))} />
            <Legend />
            {BRANCHES.map((b, i) => (
              <Bar
                key={b.id}
                dataKey={b.name.split(' ')[0]}
                fill={BRANCH_COLORS[i]}
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Branch DataTable */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Filiallar jadvali</h2>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none"
            >
              <option value="revenue">Daromad</option>
              <option value="orders">Buyurtmalar</option>
              <option value="profit">Foyda</option>
              <option value="avgCheck">O'rt. chek</option>
            </select>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Filial', 'Buyurtmalar', 'Daromad', 'Xarajat', 'Foyda', "O'rt. chek", 'Kassirlar'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((b, _idx) => {
              const pct = Math.round((b.revenue / totalRevenue) * 100);
              return (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: BRANCH_COLORS[BRANCHES.findIndex((x) => x.id === b.id)] }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-400">{b.city} · {pct}% ulush</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.orders}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(b.revenue)}</td>
                  <td className="px-4 py-3 text-red-600">{formatPrice(b.expenses)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('font-semibold', b.profit > 2_000_000 ? 'text-green-600' : 'text-amber-600')}>
                      {formatPrice(b.profit)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(b.avgCheck)}</td>
                  <td className="px-4 py-3 text-gray-600">{b.cashiers} ta</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock transfers */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <GitCompare className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Filiallar arasi ko'chirma</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Dan', 'Ga', 'Mahsulot', 'Miqdor', 'Sana', 'Holat'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {TRANSFERS.map((t) => {
              const { label, className } = TRANSFER_STATUS[t.status];
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-700">{t.from}</td>
                  <td className="px-4 py-2.5 text-gray-700">{t.to}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{t.product}</td>
                  <td className="px-4 py-2.5 text-gray-600">{t.qty} dona</td>
                  <td className="px-4 py-2.5 text-gray-500">{t.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', className)}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">Demo ma'lumotlar — T-113/T-114 backend tayyor bo'lgach real filial ma'lumotlari ko'rinadi</p>
    </div>
  );
}
