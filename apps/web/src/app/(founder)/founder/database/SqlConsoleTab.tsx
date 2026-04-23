'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, Clock, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { cn, extractErrorMessage } from '@/lib/utils';
import type { DbQueryResult } from '@/types/founder';

// SQL Console tab — raw SQL editor with results table
export function SqlConsoleTab() {
  const [sql, setSql] = useState('SELECT * FROM tenants LIMIT 10;');
  const [result, setResult] = useState<DbQueryResult | null>(null);

  const executeMutation = useMutation({
    mutationFn: (query: string) => founderApi.db.executeQuery(query),
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Выполнено (${data.executionTimeMs}ms)`);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const handleExecute = useCallback(() => {
    const trimmed = sql.trim();
    if (!trimmed) return;
    executeMutation.mutate(trimmed);
  }, [sql, executeMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
    },
    [handleExecute],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* SQL Input */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          placeholder="SELECT * FROM tenants LIMIT 10;"
          className="w-full rounded-lg border border-gray-200 bg-gray-900 px-4 py-3 font-mono text-sm text-green-400 outline-none placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleExecute}
            disabled={executeMutation.isPending || !sql.trim()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition',
              executeMutation.isPending
                ? 'cursor-not-allowed bg-violet-400'
                : 'bg-violet-600 hover:bg-violet-700',
            )}
          >
            <Play className="h-4 w-4" />
            {executeMutation.isPending ? 'Выполнение...' : 'Выполнить (Ctrl+Enter)'}
          </button>
          {result && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {result.executionTimeMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white">
          {result.type === 'SELECT' ? (
            <>
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm text-gray-600">
                  {result.columns.length} столбцов, {result.rowCount} строк
                  <span className="ml-2 text-gray-400">({result.executionTimeMs}ms)</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="whitespace-nowrap px-3 py-2 text-left font-mono text-xs font-medium text-gray-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {result.columns.map((col) => {
                          const val = row[col];
                          return (
                            <td
                              key={col}
                              className="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-700"
                            >
                              <CellValue value={val} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-700">
                {result.message ?? 'Выполнено успешно'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {result.rowCount} строк изменено ({result.executionTimeMs}ms)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Render cell value with null/redacted handling
function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>;
  }
  if (value === '[REDACTED]') {
    return (
      <span className="flex items-center gap-1 text-gray-400">
        <Lock className="h-3 w-3" />
        REDACTED
      </span>
    );
  }
  if (typeof value === 'object') {
    return <span>{JSON.stringify(value)}</span>;
  }
  return <span>{String(value)}</span>;
}
