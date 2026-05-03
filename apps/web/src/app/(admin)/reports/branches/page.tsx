'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { GitCompare, ArrowUpDown, TrendingUp, TrendingDown, Minus, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { apiClient } from '@/api/client';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BranchComparisonItem {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  growth: number;
}

interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

type Period = 'today' | 'week' | 'month' | 'year';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Bugun' },
  { value: 'week', label: 'Hafta' },
  { value: 'month', label: 'Oy' },
  { value: 'year', label: 'Yil' },
];

type SortKey = 'revenue' | 'orders' | 'avgOrderValue' | 'growth';

const SORT_OPTIONS = [
  { value: 'revenue', label: 'Daromad' },
  { value: 'orders', label: 'Buyurtmalar' },
  { value: 'avgOrderValue', label: "O'rt. chek" },
  { value: 'growth', label: "O'sish %" },
];

const BRANCH_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];

// ─── API hooks ──────────────────────────────────────────────────────────────

function useBranchComparison(period: Period) {
  return useQuery({
    queryKey: ['branch-comparison', period],
    queryFn: () =>
      apiClient
        .get<BranchComparisonItem[]>('/analytics/branch-comparison', { params: { period } })
        .then((r) => r.data),
    staleTime: 30_000,
  });
}

function useBranchSalesTrend(branchIds: string[]) {
  const now = Date.now();
  const weekAgo = new Date(now - 6 * 86400000).toISOString().slice(0, 10);
  const today = new Date(now).toISOString().slice(0, 10);

  return useQuery({
    queryKey: ['branch-sales-trend', branchIds, weekAgo, today],
    queryFn: async () => {
      if (branchIds.length === 0) return [];
      const results = await Promise.all(
        branchIds.map((id) =>
          apiClient
            .get<SalesTrendPoint[]>('/analytics/sales-trend', {
              params: { period: 'daily', from: weekAgo, to: today, branch_id: id },
            })
            .then((r) => ({ branchId: id, data: Array.isArray(r.data) ? r.data : [] }))
            .catch(() => ({ branchId: id, data: [] })),
        ),
      );
      return results;
    },
    enabled: branchIds.length > 0 && !!weekAgo && !!today,
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function BranchReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');

  const { data: branches, isLoading, error } = useBranchComparison(period);
  const branchIds = (branches ?? []).map((b) => b.branchId);
  const { data: trendData } = useBranchSalesTrend(branchIds);

  const sorted = [...(branches ?? [])].sort((a, b) => b[sortKey] - a[sortKey]);
  const totalRevenue = (branches ?? []).reduce((s, b) => s + b.revenue, 0);
  const totalOrders = (branches ?? []).reduce((s, b) => s + b.orders, 0);
  const avgGrowth = (branches ?? []).length > 0
    ? (branches ?? []).reduce((s, b) => s + b.growth, 0) / (branches ?? []).length
    : 0;

  // Build weekly chart data from trends
  const weeklyChart = buildWeeklyChart(branches ?? [], trendData ?? []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Ma'lumot yuklashda xatolik yuz berdi
        </div>
      </div>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Filiallar taqqoslama</h1>
          <SearchableDropdown
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(val) => setPeriod((val || 'month') as Period)}
            searchable={false}
            clearable={false}
            className="w-36"
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-base font-medium text-gray-600">Filiallar topilmadi</p>
          <p className="mt-1 text-sm text-gray-400">
            Hali hech qanday faol filial mavjud emas yoki tanlangan davrda savdo yo&apos;q.
          </p>
          <Link
            href="/settings/branches"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Building2 className="h-4 w-4" />
            Filiallarni sozlash →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Filiallar taqqoslama</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {branches.length} ta filial
          </p>
        </div>
        <SearchableDropdown
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(val) => setPeriod((val || 'month') as Period)}
          searchable={false}
          clearable={false}
          className="w-36"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Jami daromad" value={formatPrice(totalRevenue)} note="barcha filiallar" />
        <SummaryCard label="Jami buyurtmalar" value={`${totalOrders} ta`} note={`${PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? ''} davomida`} />
        <SummaryCard
          label="O'rtacha o'sish"
          value={`${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`}
          note="oldingi davr bilan"
          valueColor={avgGrowth > 0 ? 'text-green-600' : avgGrowth < 0 ? 'text-red-600' : 'text-gray-900'}
        />
      </div>

      {/* 7-kunlik trend */}
      {weeklyChart.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">7 kunlik daromad taqqoslama</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyChart} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
              <Legend />
              {branches.slice(0, 8).map((b, i) => (
                <Bar
                  key={b.branchId}
                  dataKey={b.branchName}
                  fill={BRANCH_COLORS[i % BRANCH_COLORS.length]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Branch DataTable */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Filiallar jadvali</h2>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <SearchableDropdown
              options={SORT_OPTIONS}
              value={sortKey}
              onChange={(val) => setSortKey((val || 'revenue') as SortKey)}
              searchable={false}
              clearable={false}
              className="w-44"
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Filial', 'Buyurtmalar', 'Daromad', "O'rt. chek", "O'sish", 'Ulush'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((b, idx) => {
              const pct = totalRevenue > 0 ? Math.round((b.revenue / totalRevenue) * 100) : 0;
              return (
                <tr key={b.branchId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: BRANCH_COLORS[idx % BRANCH_COLORS.length] }}
                      />
                      <p className="font-medium text-gray-900">{b.branchName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.orders}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(b.revenue)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(b.avgOrderValue)}</td>
                  <td className="px-4 py-3">
                    <GrowthBadge growth={b.growth} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Transfers — placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-center">
        <GitCompare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">Filiallar arasi ko'chirma — T-114 backend tayyor bo'lgach ko'rinadi</p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SummaryCard({ label, value, note, valueColor }: {
  label: string; value: string; note: string; valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('mt-0.5 text-xl font-bold', valueColor ?? 'text-gray-900')}>{value}</p>
      <p className="text-xs text-gray-400">{note}</p>
    </div>
  );
}

function GrowthBadge({ growth }: { growth: number }) {
  if (growth > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
        <TrendingUp className="h-3 w-3" />+{growth.toFixed(1)}%
      </span>
    );
  }
  if (growth < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
        <TrendingDown className="h-3 w-3" />{growth.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
      <Minus className="h-3 w-3" />0%
    </span>
  );
}

function buildWeeklyChart(
  branches: BranchComparisonItem[],
  trendData: { branchId: string; data: SalesTrendPoint[] }[],
) {
  if (branches.length === 0 || trendData.length === 0) return [];

  // Collect all unique dates
  const dateSet = new Set<string>();
  for (const t of trendData) {
    for (const point of t.data) {
      dateSet.add(point.date);
    }
  }
  const dates = [...dateSet].sort();

  // Build map branchId → branchName
  const nameMap = new Map(branches.map((b) => [b.branchId, b.branchName]));

  // Build chart data
  return dates.map((date) => {
    const row: Record<string, string | number> = {
      date: date.slice(5, 10), // "MM-DD" — backend returns ISO "2026-05-01T00:00:00.000Z"
    };
    for (const t of trendData) {
      const name = nameMap.get(t.branchId) ?? t.branchId;
      const point = t.data.find((p) => p.date === date);
      row[name] = point ? Number(point.revenue) : 0;
    }
    return row;
  });
}
