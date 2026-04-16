'use client';

import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface ScrollableTableProps {
  children: React.ReactNode;
  maxHeight?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  totalCount?: number;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  pagination?: PaginationConfig;
  className?: string;
}

const PAGE_SIZES = [10, 20, 50, 100];

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationConfig) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Build visible page numbers (max 5)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        {total === 0 ? "Ma'lumot topilmadi" : `${start}–${end} / ${total} ta`}
      </p>
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Ko'rsatish:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {getPageNumbers().map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={cn(
                'flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-1.5 text-xs font-medium transition',
                num === page
                  ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScrollableTable({
  children,
  maxHeight = 'calc(100vh - 320px)',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Qidirish...',
  filters,
  totalCount,
  emptyState,
  isLoading,
  pagination,
  className,
}: ScrollableTableProps) {
  const hasToolbar = onSearchChange || filters || totalCount !== undefined;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            {onSearchChange && (
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchValue ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
                />
              </div>
            )}
            {filters && (
              <div className="flex flex-wrap items-center gap-2">
                {filters}
              </div>
            )}
          </div>
          {totalCount !== undefined && (
            <span className="shrink-0 text-xs font-medium text-gray-400">
              {totalCount} ta
            </span>
          )}
        </div>
      )}

      {/* Table area */}
      <div
        className="overflow-x-auto overflow-y-auto custom-scrollbar"
        style={{ maxHeight }}
      >
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Empty state overlay (when no children data) */}
      {!isLoading && emptyState && (
        <div>{emptyState}</div>
      )}

      {/* Pagination */}
      {pagination && !isLoading && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}
