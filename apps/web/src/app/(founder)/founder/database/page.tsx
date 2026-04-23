'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  Search,
  HardDrive,
  Plug,
  Table2,
  Clock,
} from 'lucide-react';
import { founderApi } from '@/api/founder.api';
import { cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { SqlConsoleTab } from './SqlConsoleTab';
import { MigrationsTab } from './MigrationsTab';
import { TableDataPanel } from './TableDataPanel';
import type { DbTableInfo, DbStats } from '@/types/founder';

type Tab = 'tables' | 'sql' | 'migrations';

// Table categories for sidebar grouping
const TABLE_CATEGORIES: Record<string, string[]> = {
  Identity: [
    'tenants', 'users', 'branches', 'admin_users', 'sessions',
    'api_keys', 'login_attempts', 'user_locks', 'pin_attempts',
  ],
  Catalog: [
    'categories', 'units', 'products', 'product_barcodes', 'product_variants',
    'bundle_items', 'product_prices', 'product_certificates', 'promotions',
    'suppliers', 'product_suppliers',
  ],
  Inventory: [
    'warehouses', 'stock_movements', 'stock_snapshots', 'stock_transfers',
    'stock_transfer_items', 'warehouse_invoices', 'warehouse_invoice_items',
  ],
  Sales: ['shifts', 'orders', 'order_items', 'returns', 'return_items', 'z_reports'],
  Finance: ['payment_intents', 'expenses', 'journal_entries', 'journal_lines', 'exchange_rates'],
  Customers: [
    'customers', 'debt_records', 'debt_payments', 'loyalty_configs',
    'loyalty_accounts', 'loyalty_transactions',
  ],
  Support: ['support_tickets', 'ticket_messages', 'tasks'],
  Notifications: [
    'notifications', 'fcm_tokens', 'reminder_logs',
    'telegram_link_tokens', 'bot_otp_tokens',
  ],
  Audit: ['audit_logs', 'event_log', 'price_changes', 'client_error_logs'],
  Billing: ['subscription_plans', 'tenant_subscriptions', 'tenant_settings', 'feature_flags'],
  Sync: ['sync_outbox'],
  'Real Estate': ['properties', 'rental_contracts', 'rental_payments'],
};

export default function FounderDatabasePage() {
  const [tab, setTab] = useState<Tab>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');

  // Data fetching
  const { data: stats } = useQuery<DbStats>({
    queryKey: ['admin-db', 'stats'],
    queryFn: () => founderApi.db.getStats(),
    staleTime: 30_000,
  });

  const { data: tables, isLoading: tablesLoading } = useQuery<DbTableInfo[]>({
    queryKey: ['admin-db', 'tables'],
    queryFn: () => founderApi.db.listTables(),
    staleTime: 30_000,
  });

  // Group tables by category with search filtering
  const groupedTables = useMemo(() => {
    if (!tables) return {};
    const search = tableSearch.toLowerCase();
    const tableMap = new Map(tables.map((t) => [t.name, t]));
    const groups: Record<string, DbTableInfo[]> = {};
    const categorized = new Set<string>();

    for (const [category, names] of Object.entries(TABLE_CATEGORIES)) {
      const matched = names
        .map((n) => tableMap.get(n))
        .filter((t): t is DbTableInfo => !!t && (!search || t.name.includes(search)));
      if (matched.length > 0) {
        groups[category] = matched;
        matched.forEach((t) => categorized.add(t.name));
      }
    }

    // Uncategorized tables
    const other = tables.filter(
      (t) => !categorized.has(t.name) && (!search || t.name.includes(search)),
    );
    if (other.length > 0) groups['Boshqa'] = other;

    return groups;
  }, [tables, tableSearch]);

  const currentTableInfo = tables?.find((t) => t.name === selectedTable);

  const handleSelectTable = useCallback((name: string) => {
    setSelectedTable(name);
  }, []);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'tables', label: 'Таблицы' },
    { key: 'sql', label: 'SQL Console' },
    { key: 'migrations', label: 'Миграции' },
  ];

  const STAT_CARDS = stats
    ? [
        { label: 'Размер БД', value: `${stats.dbSizeMb} MB`, icon: HardDrive, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Соединения', value: `${stats.activeConnections}/${stats.maxConnections}`, icon: Plug, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Таблицы', value: String(stats.tablesCount), icon: Table2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Uptime', value: stats.uptime, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Database className="h-5 w-5 text-violet-500" />
          Database Manager
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">PostgreSQL {stats?.version ?? ''}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 self-start">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition',
              tab === t.key ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'tables' && (
        <>
          {/* Stat cards */}
          {STAT_CARDS.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {STAT_CARDS.map((c) => (
                <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">{c.label}</p>
                    <div className={cn('rounded-lg p-1.5', c.bg)}>
                      <c.icon className={cn('h-4 w-4', c.color)} />
                    </div>
                  </div>
                  <p className={cn('text-xl font-bold', c.color)}>{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Two-column layout: sidebar + data */}
          <div className="flex gap-4">
            {/* Sidebar: table list */}
            <div className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Поиск таблицы..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-violet-400"
                  />
                </div>
              </div>
              <div className="max-h-[calc(100vh-380px)] overflow-y-auto p-2">
                {tablesLoading ? (
                  <LoadingSkeleton variant="line" className="m-2" />
                ) : (
                  Object.entries(groupedTables).map(([category, items]) => (
                    <div key={category} className="mb-3">
                      <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {category}
                      </p>
                      {items.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => handleSelectTable(t.name)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition',
                            selectedTable === t.name
                              ? 'bg-violet-50 text-violet-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50',
                          )}
                        >
                          <span className="truncate">{t.name}</span>
                          <span className="ml-1 shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                            {t.rowCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right panel: data table — min-w-0 prevents flex child from overflowing */}
            <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
              {!selectedTable ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Выберите таблицу слева
                </div>
              ) : (
                <TableDataPanel
                  key={selectedTable}
                  selectedTable={selectedTable}
                  tableInfo={currentTableInfo}
                />
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'sql' && <SqlConsoleTab />}
      {tab === 'migrations' && <MigrationsTab />}
    </div>
  );
}
