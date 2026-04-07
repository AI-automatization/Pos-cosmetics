'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string | null;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  className?: string;
  name?: string;
  onBlur?: () => void;
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = '— Tanlang —',
  searchPlaceholder = 'Qidirish...',
  emptyMessage = 'Topilmadi',
  required,
  disabled,
  clearable = true,
  searchable = true,
  className,
  name,
  onBlur,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel ?? '').toLowerCase().includes(q),
    );
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onBlur]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(-1);
  }, [filtered.length, search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    items[highlightIdx]?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen((v) => !v);
    setSearch('');
    setHighlightIdx(-1);
    setTimeout(() => searchRef.current?.focus(), 30);
  }, [disabled]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setSearch('');
      onBlur?.();
    },
    [onChange, onBlur],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearch('');
      onBlur?.();
    },
    [onChange, onBlur],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleOpen();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIdx((i) => (i < filtered.length - 1 ? i + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIdx >= 0 && filtered[highlightIdx]) {
            handleSelect(filtered[highlightIdx].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setSearch('');
          onBlur?.();
          break;
      }
    },
    [open, filtered, highlightIdx, handleOpen, handleSelect, onBlur],
  );

  return (
    <div ref={containerRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200',
          'bg-white shadow-sm outline-none',
          'hover:border-gray-400',
          open
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-100'
            : 'border-gray-300',
          disabled && 'cursor-not-allowed bg-gray-50 text-gray-400 opacity-70',
        )}
      >
        <span className={cn('flex-1 truncate', selected ? 'text-gray-900 font-medium' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {clearable && selected && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="rounded-md p-0.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              open && 'rotate-180 text-blue-500',
            )}
          />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-150',
          )}
        >
          {/* Search */}
          {searchable && (
            <div className="flex items-center gap-2 border-b border-gray-100 px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="shrink-0 text-gray-400 transition hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <div ref={listRef} className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <div className="px-3.5 py-6 text-center text-sm text-gray-400">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightIdx;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-option
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors',
                      isHighlighted && 'bg-blue-50',
                      isSelected && !isHighlighted && 'bg-blue-50/60',
                      !isHighlighted && !isSelected && 'hover:bg-gray-50',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate',
                          isSelected ? 'font-semibold text-blue-700' : 'text-gray-900',
                        )}
                      >
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className="block truncate text-xs text-gray-400 mt-0.5">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Hidden input for native form validation */}
      {required && (
        <input
          type="text"
          name={name}
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
