'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useSuppliers } from '@/hooks/catalog/useSuppliers';
import { cn } from '@/lib/utils';

interface SupplierSearchSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function SupplierSearchSelect({
  value,
  onChange,
  placeholder = 'Yetkazib beruvchi...',
  required,
}: SupplierSearchSelectProps) {
  const { data: suppliers = [] } = useSuppliers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value → internal search text
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If typed text doesn't match a supplier exactly, keep it as free-text
        onChange(search);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, search, onChange]);

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.company ?? '').toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    (name: string) => {
      onChange(name);
      setSearch(name);
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearch('');
      inputRef.current?.focus();
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={search}
          required={required}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          className={cn(
            'w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm outline-none transition',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          )}
        />
        {search ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              'absolute right-2 h-4 w-4 text-gray-400 transition-transform',
              open && 'rotate-180',
            )}
          />
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-gray-400">
              {search ? `"${search}" — yangi yetkazib beruvchi sifatida saqlanadi` : 'Yetkazib beruvchilar yo\'q'}
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.name)}
                className={cn(
                  'flex w-full flex-col items-start px-3 py-2 text-left text-sm transition hover:bg-blue-50',
                  search === s.name && 'bg-blue-50 font-medium text-blue-700',
                )}
              >
                <span className="font-medium text-gray-900">{s.name}</span>
                {s.company && (
                  <span className="text-xs text-gray-400">{s.company}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
