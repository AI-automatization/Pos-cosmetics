'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, FlaskConical } from 'lucide-react';
import { useStock, useMovementsWithUsers, useInvoices } from '@/hooks/inventory/useInventory';
import { StockInModal } from './StockInModal';
import { StockOutModal } from './StockOutModal';
import { TesterModal } from './TesterModal';
import { ProductStockDrawer } from './ProductStockDrawer';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';
import { InventoryStockTab } from './_components/InventoryStockTab';
import { InventoryMovementsTab } from './_components/InventoryMovementsTab';
import { InventoryInvoicesTab } from './_components/InventoryInvoicesTab';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { StockLevel } from '@/types/inventory';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stock' | 'movements' | 'invoices'>('stock');
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [testerOpen, setTesterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockLevel | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const isOwner = currentUser?.role === 'OWNER';

  const { data: stock, isLoading, isError, refetch } = useStock({ search: search || undefined });
  const { data: movements, isLoading: movLoading } = useMovementsWithUsers();
  const { data: invoicesData, isLoading: invLoading } = useInvoices({ limit: 50 });

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('inventory.stockStatus')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {stock ? t('inventory.productCount', { count: stock.length }) : t('common.loading')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/inventory/low-stock"
            className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
          >
            <AlertTriangle className="h-4 w-4" />
            {t('inventory.lowStock')}
          </a>
          <button
            type="button"
            onClick={() => setTesterOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100"
          >
            <FlaskConical className="h-4 w-4" />
            {t('inventory.tester')}
          </button>
          {!isOwner && (
            <button
              type="button"
              onClick={() => setStockOutOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowUpFromLine className="h-4 w-4" />
              {t('inventory.stockOut')}
            </button>
          )}
          {!isOwner && (
            <button
              type="button"
              onClick={() => setStockInOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <ArrowDownToLine className="h-4 w-4" />
              {t('inventory.stockIn')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('stock')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'stock'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          {t('inventory.stockStatus')}
        </button>
        <button
          type="button"
          onClick={() => setTab('movements')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'movements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          {t('inventory.movementHistory')}
          {movements && movements.length > 0 && (
            <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
              {movements.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('invoices')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          {t('inventory.invoices')}
          {invoicesData && invoicesData.total > 0 && (
            <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
              {invoicesData.total}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {tab === 'stock' && (
        <InventoryStockTab
          stock={stock}
          isLoading={isLoading}
          isError={isError}
          search={search}
          onSearchChange={setSearch}
          onSelectProduct={setSelectedProduct}
          onRetry={refetch}
        />
      )}

      {tab === 'movements' && (
        <InventoryMovementsTab
          movements={movements}
          isLoading={movLoading}
        />
      )}

      {tab === 'invoices' && (
        <InventoryInvoicesTab
          invoicesData={invoicesData}
          isLoading={invLoading}
          onViewInvoice={setSelectedInvoiceId}
        />
      )}

      {/* Modals */}
      {!isOwner && <StockInModal isOpen={stockInOpen} onClose={() => setStockInOpen(false)} />}
      {!isOwner && <StockOutModal isOpen={stockOutOpen} onClose={() => setStockOutOpen(false)} />}
      <TesterModal isOpen={testerOpen} onClose={() => setTesterOpen(false)} />

      <ProductStockDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <InvoiceDetailDrawer
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </div>
  );
}
