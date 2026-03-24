'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { useProducts } from '@/hooks/catalog/useProducts';
import { cn } from '@/lib/utils';

interface ProductOption {
  id: string;
  name: string;
  barcode?: string | null;
  sku?: string | null;
  unit?: string;
}

interface ProductSearchSelectProps {
  value: string; // productId
  onChange: (id: string, product?: ProductOption) => void;
  placeholder?: string;
  required?: boolean;
}

export function ProductSearchSelect({
  value,
  onChange,
  placeholder = 'Mahsulot qidiring...',
  required,
}: ProductSearchSelectProps) {
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.items ?? [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = products.find((p) => p.id === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode ?? '').toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    (p: ProductOption) => {
      onChange(p.id, p);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearch('');
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setSearch('');
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition',
          'border-gray-300 bg-white outline-none hover:border-blue-400',
          open && 'border-blue-500 ring-2 ring-blue-500/20',
          !selected && 'text-gray-400',
        )}
      >
        <span className={cn('flex-1 truncate', selected ? 'text-gray-900' : 'text-gray-400')}>
          {selected ? selected.name : placeholder}
        </span>
        <div className="ml-2 flex items-center gap-1">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="rounded p-0.5 text-gray-400 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nomi yoki barcode..."
              className="w-full text-sm outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                Mahsulot topilmadi
              </div>
            ) : (
              filtered.map((p) => {
                const unit = typeof p.unit === 'object' ? (p.unit as { name: string })?.name : String(p.unit ?? '');
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect({ id: p.id, name: p.name, barcode: p.barcode, sku: p.sku, unit })}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-blue-50',
                      p.id === value && 'bg-blue-50 font-medium text-blue-700',
                    )}
                  >
                    <div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                      {p.barcode && <span className="ml-2 text-xs text-gray-400">{p.barcode}</span>}
                    </div>
                    {unit && <span className="ml-2 text-xs text-gray-400">{unit}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Hidden required input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          className="absolute h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
