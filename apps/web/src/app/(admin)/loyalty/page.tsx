'use client';

import Link from 'next/link';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  Settings,
  History,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { useLoyaltyStats, useLoyaltyTransactions } from '@/hooks/loyalty/useLoyalty';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';
import type { LoyaltyTxType } from '@/types/loyalty';

const TX_TYPE_CONFIG: Record<LoyaltyTxType, { label: string; color: string }> = {
  EARN: { label: 'Earned', color: 'bg-green-100 text-green-700' },
  REDEEM: { label: 'Redeemed', color: 'bg-blue-100 text-blue-700' },
  ADJUST: { label: 'Adjusted', color: 'bg-orange-100 text-orange-700' },
  EXPIRE: { label: 'Expired', color: 'bg-gray-100 text-gray-600' },
};

function TxTypeBadge({ type }: { type: LoyaltyTxType }) {
  const cfg = TX_TYPE_CONFIG[type] ?? TX_TYPE_CONFIG.ADJUST;
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', cfg.color)}>
      {cfg.label}
    </span>
  );
}

export default function LoyaltyDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useLoyaltyStats();
  const { data: txData, isLoading: txLoading } = useLoyaltyTransactions(1, 10);

  const statCards = [
    {
      label: t('loyalty.activeCustomers') || 'Active customers',
      value: stats?.activeCustomers ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('loyalty.todayEarned') || 'Points earned today',
      value: stats?.todayEarned ?? 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: t('loyalty.todayRedeemed') || 'Points redeemed today',
      value: stats?.todayRedeemed ?? 0,
      icon: TrendingDown,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: t('loyalty.totalPoints') || 'Total points in circulation',
      value: stats?.totalPoints ?? 0,
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const quickLinks = [
    {
      href: '/loyalty/settings',
      icon: Settings,
      label: t('loyalty.settings') || 'Program Settings',
      desc: t('loyalty.settingsDesc') || 'Configure earn/redeem rates',
      color: 'border-blue-200 hover:bg-blue-50',
    },
    {
      href: '/loyalty/customers',
      icon: Users,
      label: t('loyalty.customers') || 'Loyalty Customers',
      desc: t('loyalty.customersDesc') || 'View and adjust customer points',
      color: 'border-green-200 hover:bg-green-50',
    },
    {
      href: '/loyalty/history',
      icon: History,
      label: t('loyalty.history') || 'Transaction History',
      desc: t('loyalty.historyDesc') || 'All earn / redeem transactions',
      color: 'border-purple-200 hover:bg-purple-50',
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Gift className="h-5 w-5 text-purple-600" />
            {t('loyalty.title') || 'Loyalty Program'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {t('loyalty.subtitle') || 'Manage customer loyalty points and rewards'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={cn('rounded-xl border border-gray-100 p-4', card.bg)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <Icon className={cn('h-4 w-4', card.color)} />
                </div>
                <p className={cn('mt-2 text-2xl font-bold', card.color)}>
                  {card.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group flex items-center justify-between rounded-xl border bg-white p-4 transition',
                link.color,
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition" />
            </Link>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            {t('loyalty.recentTransactions') || 'Recent Transactions'}
          </h2>
          <Link
            href="/loyalty/history"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            {t('common.viewAll') || 'View all'}
          </Link>
        </div>

        {txLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : !txData?.items?.length ? (
          <p className="py-10 text-center text-sm text-gray-400">
            {t('loyalty.noTransactions') || 'No transactions yet'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('common.date') || 'Date'}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('customers.title') || 'Customer'}
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('common.type') || 'Type'}
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('loyalty.points') || 'Points'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txData.items.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">
                      {tx.customer?.name ?? tx.customerId}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <TxTypeBadge type={tx.type} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      <span
                        className={cn(
                          tx.points > 0 ? 'text-green-600' : 'text-red-600',
                        )}
                      >
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
