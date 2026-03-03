'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useExpenses, useCreateExpense, useDeleteExpense, useProfitReport } from '@/hooks/finance/useFinance';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { ExpenseCategory } from '@/types/finance';
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS } from '@/types/finance';

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

const expenseSchema = z.object({
  category: z.enum(['RENT', 'SALARY', 'DELIVERY', 'UTILITIES', 'OTHER'] as const),
  description: z.string().min(2, 'Kamida 2 belgi'),
  amount: z.coerce.number().min(1, 'Summa 0 dan katta bo\'lsin'),
  date: z.string().min(1, 'Sana tanlang'),
});
type ExpenseForm = z.infer<typeof expenseSchema>;

function CreateExpenseModal({ onClose }: { onClose: () => void }) {
  const { mutate: create, isPending } = useCreateExpense();
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: 'RENT', description: '', amount: 0, date: today },
  });

  const onSubmit = (data: ExpenseForm) => {
    create(data, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Xarajat qo'shish</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategoriya</label>
            <select
              {...register('category')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tavsif</label>
            <input
              {...register('description')}
              placeholder="Xarajat haqida qisqacha..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Summa (so'm)</label>
            <input
              {...register('amount')}
              type="number"
              min={0}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sana</label>
            <input
              {...register('date')}
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Bekor
            </button>
            <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {isPending ? 'Saqlanmoqda...' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryDot({ category }: { category: ExpenseCategory }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[category] }}
    />
  );
}

export default function ExpensesPage() {
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');

  const { data: expenses, isLoading: loadingExp } = useExpenses(
    categoryFilter !== 'ALL' ? { category: categoryFilter } : undefined,
  );
  const { data: profit, isLoading: loadingProfit } = useProfitReport(monthAgo, today);
  const { mutate: deleteExpense } = useDeleteExpense();

  if (loadingExp || loadingProfit) return <LoadingSkeleton variant="table" rows={4} />;

  const pieData = profit?.expensesByCategory.map((e) => ({
    name: EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory],
    value: e.total,
    color: EXPENSE_CATEGORY_COLORS[e.category as ExpenseCategory],
  })) ?? [];

  const totalExpenses = expenses?.reduce((s, e) => s + e.amount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Xarajatlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">Oylik xarajatlar va foyda tahlili</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Xarajat qo'shish
        </button>
      </div>

      {/* Profit summary cards */}
      {profit && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Daromad', value: profit.revenue, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Yalpi foyda', value: profit.grossProfit, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Xarajatlar', value: profit.totalExpenses, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Sof foyda', value: profit.netProfit, icon: TrendingUp, color: profit.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: profit.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className={cn('mb-2 inline-flex rounded-lg p-2', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={cn('mt-0.5 text-lg font-bold', color)}>{formatPrice(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart + Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Kategoriya bo'yicha</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expenses Table */}
        <div className={cn('rounded-xl border border-gray-200 bg-white', pieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3')}>
          {/* Filter bar */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              Jami: <span className="text-red-600">{formatPrice(totalExpenses)}</span>
            </p>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'ALL')}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            >
              <option value="ALL">Barcha kategoriyalar</option>
              {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Sana', 'Kategoriya', 'Tavsif', 'Summa', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(expenses ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">Xarajat topilmadi</td>
                </tr>
              ) : (expenses ?? []).map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{exp.date}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <CategoryDot category={exp.category} />
                      <span className="text-gray-700">{EXPENSE_CATEGORY_LABELS[exp.category]}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{exp.description}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(exp.amount)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CreateExpenseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
