'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatPrice, cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ChartTooltip, CHART_COLORS, EmptyState } from './AnalyticsShared';

interface TopProduct {
  productId: string;
  productName: string;
  qtySold: number | string;
  revenue: number;
  margin: number;
}

interface Props {
  topProducts: TopProduct[];
  isLoading: boolean;
}

const PRODUCTS_PER_PAGE = 10;

export function AnalyticsProductsTab({ topProducts, isLoading }: Props) {
  const [productsSearch, setProductsSearch] = useState('');
  const [productsPage, setProductsPage] = useState(0);

  const filteredProducts = useMemo(() =>
    topProducts.filter((p) =>
      !productsSearch || p.productName.toLowerCase().includes(productsSearch.toLowerCase())
    ), [topProducts, productsSearch]);

  const productsPageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const pagedProducts = filteredProducts.slice(
    productsPage * PRODUCTS_PER_PAGE,
    (productsPage + 1) * PRODUCTS_PER_PAGE,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">
          Top mahsulotlar
          <span className="ml-2 text-xs font-normal text-gray-400">({filteredProducts.length} ta)</span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={productsSearch}
            onChange={(e) => { setProductsSearch(e.target.value); setProductsPage(0); }}
            placeholder="Qidirish..."
            className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition w-56"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState label="Ma'lumotlar topilmadi" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={Math.min(400, pagedProducts.length * 40 + 40)}>
            <BarChart data={pagedProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => {
                  const n = Number(v);
                  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
                }}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis type="category" dataKey="productName" tick={{ fontSize: 12, fill: '#475569' }} width={150} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Daromad" radius={[0, 8, 8, 0]} barSize={24}>
                {pagedProducts.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Mahsulot', 'Sotildi', 'Daromad', 'Marja'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedProducts.map((p, i) => (
                  <tr key={p.productId} className="transition hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                        {productsPage * PRODUCTS_PER_PAGE + i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.productName}</td>
                    <td className="px-4 py-3 text-gray-500">{Number(p.qtySold).toFixed(0)} dona</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-600">{formatPrice(p.margin)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productsPageCount > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              {Array.from({ length: productsPageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setProductsPage(i)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-sm font-medium transition',
                    productsPage === i
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
