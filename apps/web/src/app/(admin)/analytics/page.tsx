'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, AlertTriangle } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

// ─── Demo data ────────────────────────────────────────────────────────────────

const today = new Date();
const TREND_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (29 - i));
  const base = 1_200_000 + Math.sin(i / 4) * 300_000;
  return {
    date: d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }),
    revenue: Math.round(base + Math.random() * 400_000),
    orders: Math.round(14 + Math.random() * 12),
  };
});

const TOP_PRODUCTS = [
  { name: 'Nivea Krem 150ml', revenue: 1_440_000, qty: 45, margin: 37 },
  { name: 'Maybelline Pomada', revenue: 1_250_000, qty: 31, margin: 42 },
  { name: 'Garnier Toner', revenue: 960_000, qty: 24, margin: 35 },
  { name: "L'Oreal Maskara", revenue: 840_000, qty: 21, margin: 40 },
  { name: 'Neutrogena Yuz kremi', revenue: 720_000, qty: 18, margin: 33 },
  { name: 'Dove Dezodorant', revenue: 660_000, qty: 55, margin: 28 },
];

const DEAD_STOCK = [
  { name: 'NYX Contour', sku: 'NYX-002', lastSold: 45, qty: 8, carryingCost: 160_000 },
  { name: 'MAC Korrektör', sku: 'MAC-011', lastSold: 38, qty: 5, carryingCost: 200_000 },
  { name: 'Clinique Toner', sku: 'CLI-003', lastSold: 32, qty: 12, carryingCost: 480_000 },
  { name: 'Bobbi Brown CC', sku: 'BOB-001', lastSold: 31, qty: 3, carryingCost: 270_000 },
];

const CATEGORY_MARGIN = [
  { category: 'Makiyaj', margin: 41, revenue: 4_200_000 },
  { category: 'Kremlar', margin: 36, revenue: 3_600_000 },
  { category: 'Atir', margin: 45, revenue: 2_800_000 },
  { category: 'Gigiyena', margin: 28, revenue: 1_900_000 },
  { category: 'Teri parvarishi', margin: 38, revenue: 2_100_000 },
];

const CASHIER_PERF = [
  { name: 'Malika Rahimova', orders: 187, revenue: 8_450_000, avg: 45_187, voids: 2, discounts: 3 },
  { name: 'Jasur Karimov', orders: 154, revenue: 6_230_000, avg: 40_455, voids: 1, discounts: 5 },
  { name: 'Nilufar Xasanova', orders: 98, revenue: 3_920_000, avg: 40_000, voids: 0, discounts: 2 },
];

const HOURLY = Array.from({ length: 13 }, (_, h) => {
  const hour = h + 8; // 8:00 — 20:00
  const peak = hour >= 11 && hour <= 14 || hour >= 17 && hour <= 19;
  return {
    hour: `${hour}:00`,
    orders: peak ? Math.round(8 + Math.random() * 8) : Math.round(1 + Math.random() * 5),
  };
});

// ─── Components ───────────────────────────────────────────────────────────────

type Tab = 'trend' | 'products' | 'margin' | 'cashiers' | 'heatmap' | 'deadstock';

const TABS: { key: Tab; label: string }[] = [
  { key: 'trend', label: 'Sotuv trendi' },
  { key: 'products', label: 'Top mahsulotlar' },
  { key: 'margin', label: 'Marja tahlili' },
  { key: 'cashiers', label: 'Kassirlar' },
  { key: 'heatmap', label: 'Soatlik faollik' },
  { key: 'deadstock', label: 'Harakatsiz tovar' },
];

const MARGIN_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('trend');

  const totalRevenue30 = TREND_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalOrders30 = TREND_DATA.reduce((s, d) => s + d.orders, 0);
  const avgCheck = totalOrders30 > 0 ? Math.round(totalRevenue30 / totalOrders30) : 0;
  const avgMargin = Math.round(CATEGORY_MARGIN.reduce((s, c) => s + c.margin, 0) / CATEGORY_MARGIN.length);

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analitika</h1>
        <p className="mt-0.5 text-sm text-gray-500">So'nggi 30 kunlik biznes tahlili</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Jami daromad (30 kun)', value: formatPrice(totalRevenue30), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Buyurtmalar soni', value: `${totalOrders30} ta`, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: "O'rtacha chek", value: formatPrice(avgCheck), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: "O'rtacha marja", value: `${avgMargin}%`, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={cn('mb-2 inline-flex rounded-lg p-2', bg)}>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={cn('mt-0.5 text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition',
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {/* Sales Trend */}
        {tab === 'trend' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">30 kunlik sotuv trendi</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={4} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => formatPrice(Number(v))} labelStyle={{ fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Daromad" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products */}
        {tab === 'products' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Top mahsulotlar (daromad bo'yicha)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => formatPrice(Number(v))} />
                <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Mahsulot', 'Miqdor', 'Daromad', 'Marja'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_PRODUCTS.map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-2 text-gray-600">{p.qty} dona</td>
                    <td className="px-4 py-2 font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                    <td className="px-4 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', p.margin >= 40 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                        {p.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Margin analysis */}
        {tab === 'margin' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Kategoriya bo'yicha marja</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CATEGORY_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="margin" name="Marja %" radius={[4, 4, 0, 0]}>
                  {CATEGORY_MARGIN.map((_, i) => <Cell key={i} fill={MARGIN_COLORS[i % MARGIN_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cashier performance */}
        {tab === 'cashiers' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Kassirlar samaradorligi</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Kassir', 'Buyurtmalar', 'Daromad', "O'rt. chek", 'Bekor', 'Chegirma'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CASHIER_PERF.map((c) => (
                  <tr key={c.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.orders}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(c.revenue)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatPrice(c.avg)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', c.voids > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}>
                        {c.voids}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', c.discounts >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500')}>
                        {c.discounts}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-gray-400">⚠ 5+ chegirma yoki 3+ bekor → shubhali faollik belgisi</p>
          </div>
        )}

        {/* Hourly heatmap */}
        {tab === 'heatmap' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Soatlik faollik (o'rtacha)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={HOURLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [`${Number(v)} ta buyurtma`, 'Buyurtma']} />
                <Bar dataKey="orders" name="Buyurtmalar" radius={[4, 4, 0, 0]}>
                  {HOURLY.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.orders >= 12 ? '#ef4444' : entry.orders >= 8 ? '#f59e0b' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500" /> Eng yuqori (12+)</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500" /> Yuqori (8-11)</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-blue-500" /> Oddiy (&lt;8)</span>
            </div>
          </div>
        )}

        {/* Dead stock */}
        {tab === 'deadstock' && (
          <div>
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-700">
                <strong>{DEAD_STOCK.length} ta mahsulot</strong> 30+ kun davomida sotilmagan — omborxona xarajati oshmoqda
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Mahsulot', 'SKU', 'Oxirgi sotuv', 'Miqdor', 'Xarajat'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEAD_STOCK.map((p) => (
                  <tr key={p.sku} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        {p.lastSold} kun oldin
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.qty} dona</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{formatPrice(p.carryingCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ABC analysis */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">ABC tahlil</h2>
        <div className="flex items-center gap-4">
          {[
            { label: 'A — Yuqori (80% daromad)', count: 3, pct: 20, color: 'bg-green-500' },
            { label: 'B — O\'rta (15% daromad)', count: 5, pct: 33, color: 'bg-yellow-500' },
            { label: 'C — Past (5% daromad)', count: 7, pct: 47, color: 'bg-gray-400' },
          ].map(({ label, count, pct, color }) => (
            <div key={label} className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className={cn('mb-2 h-2 w-full rounded-full', color.replace('bg-', 'bg-').replace('500', '100'))}>
                <div className={cn('h-2 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs font-semibold text-gray-900">{count} mahsulot ({pct}%)</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users icon at bottom for cashier activity */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Users className="h-4 w-4" />
        Demo ma'lumotlar — T-089 backend tayyorlanayotganda real analitika ko'rinadi
      </div>
    </div>
  );
}
