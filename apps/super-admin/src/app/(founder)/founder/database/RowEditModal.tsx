'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { extractErrorMessage } from '@/lib/utils';
import type { DbColumnInfo } from '@/types/founder';

const AUTO_FIELDS = new Set(['created_at', 'createdAt', 'updated_at', 'updatedAt']);
const REDACTED = '[REDACTED]';

interface RowEditModalProps {
  tableName: string;
  row: Record<string, unknown> | null; // null = create mode
  onClose: () => void;
}

export function RowEditModal({ tableName, row, onClose }: RowEditModalProps) {
  const isEdit = row !== null;
  const queryClient = useQueryClient();

  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['admin-db', 'schema', tableName],
    queryFn: () => founderApi.db.getTableSchema(tableName),
    staleTime: 60_000,
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const editableColumns = useMemo(() => {
    if (!schema) return [];
    return schema.columns.filter((c) => {
      if (AUTO_FIELDS.has(c.name)) return false;
      if (isEdit && c.isPrimaryKey) return false;
      if (isEdit && row?.[c.name] === REDACTED) return false;
      return true;
    });
  }, [schema, row, isEdit]);

  const redactedCols = useMemo(() => {
    if (!schema || !isEdit || !row) return [];
    return schema.columns.filter((c) => row[c.name] === REDACTED);
  }, [schema, row, isEdit]);

  useEffect(() => {
    if (!editableColumns.length) return;
    const init: Record<string, string> = {};
    for (const col of editableColumns) {
      const val = isEdit ? row?.[col.name] : null;
      if (val === null || val === undefined) init[col.name] = '';
      else if (typeof val === 'object') init[col.name] = JSON.stringify(val, null, 2);
      else init[col.name] = String(val);
    }
    setForm(init);
  }, [editableColumns, row, isEdit]);

  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => founderApi.db.createRow(tableName, data),
    onSuccess: () => {
      toast.success('Запись создана');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', tableName] });
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'tables'] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      founderApi.db.updateRow(tableName, String(row?.['id'] ?? ''), data),
    onSuccess: () => {
      toast.success('Запись обновлена');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', tableName] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const isPending = createMut.isPending || updateMut.isPending;

  function parseForm(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const col of editableColumns) {
      const raw = form[col.name] ?? '';
      if (raw === '' && col.nullable) { result[col.name] = null; continue; }
      if (col.type.includes('json')) {
        try { result[col.name] = JSON.parse(raw); } catch { result[col.name] = raw; }
        continue;
      }
      if (col.type === 'boolean' || col.type === 'bool') {
        result[col.name] = raw === 'true';
        continue;
      }
      if (col.type.includes('int') || col.type === 'bigint' || col.type.includes('float') ||
          col.type.includes('double') || col.type.includes('decimal') || col.type.includes('numeric')) {
        const n = Number(raw);
        result[col.name] = Number.isNaN(n) ? raw : n;
        continue;
      }
      result[col.name] = raw;
    }
    return result;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = parseForm();
    if (isEdit) updateMut.mutate(data);
    else createMut.mutate(data);
  }

  const setField = (name: string, value: string) => setForm((p) => ({ ...p, [name]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isPending ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            {isEdit ? 'Редактировать запись' : 'Добавить запись'}
            <span className="ml-2 font-mono text-xs text-gray-400">{tableName}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {schemaLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          </div>
        ) : (
          <form id="row-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
            <div className="space-y-3">
              {editableColumns.map((col) => (
                <FieldInput
                  key={col.name}
                  col={col}
                  value={form[col.name] ?? ''}
                  onChange={(v) => setField(col.name, v)}
                />
              ))}
              {redactedCols.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                    <Lock className="h-3.5 w-3.5" />
                    Защищённые поля (редактирование запрещено)
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {redactedCols.map((c) => (
                      <span
                        key={c.name}
                        className="rounded bg-gray-200 px-2 py-0.5 font-mono text-xs text-gray-500"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            form="row-edit-form"
            disabled={isPending || schemaLoading}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  col,
  value,
  onChange,
}: {
  col: DbColumnInfo;
  value: string;
  onChange: (v: string) => void;
}) {
  const isJson = col.type.includes('json');
  const isBool = col.type === 'boolean' || col.type === 'bool';

  const label = (
    <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-600">
      <span className="font-mono">{col.name}</span>
      <span className="text-[10px] text-gray-400">
        {col.type}
        {col.nullable ? ' | null' : ''}
      </span>
    </label>
  );

  if (isBool) {
    return (
      <div>
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-violet-400"
        >
          <option value="true">true</option>
          <option value="false">false</option>
          {col.nullable && <option value="">null</option>}
        </select>
      </div>
    );
  }

  if (isJson) {
    return (
      <div>
        {label}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs text-gray-700 outline-none focus:border-violet-400"
          placeholder={col.nullable ? 'null' : 'JSON...'}
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-violet-400"
        placeholder={col.nullable ? 'null' : ''}
      />
    </div>
  );
}
