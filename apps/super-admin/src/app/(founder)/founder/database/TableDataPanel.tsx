'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { cn, extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RowEditModal } from './RowEditModal';
import type { DbTableInfo, DbTableData } from '@/types/founder';

const AUTO_FIELDS = new Set(['created_at', 'createdAt', 'updated_at', 'updatedAt']);
const REDACTED = '[REDACTED]';

interface TableDataPanelProps {
  selectedTable: string;
  tableInfo: DbTableInfo | undefined;
}

// Right panel: data table with full CRUD for selected table
export function TableDataPanel({ selectedTable, tableInfo }: TableDataPanelProps) {
  const [page, setPage] = useState(1);
  const [tenantIdFilter, setTenantIdFilter] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [inlineEdit, setInlineEdit] = useState<{
    rowId: string;
    col: string;
    value: string;
  } | null>(null);
  const skipBlurRef = useRef(false);
  const queryClient = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────────────────────

  const { data: tableData, isLoading } = useQuery<DbTableData>({
    queryKey: ['admin-db', 'table-data', selectedTable, page, tenantIdFilter, sortField, sortDir],
    queryFn: () =>
      founderApi.db.getTableData(selectedTable, {
        page,
        limit: 50,
        tenantId: tenantIdFilter || undefined,
        sort: sortField,
        sortDir,
      }),
    staleTime: 15_000,
  });

  const { data: schema } = useQuery({
    queryKey: ['admin-db', 'schema', selectedTable],
    queryFn: () => founderApi.db.getTableSchema(selectedTable),
    staleTime: 60_000,
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => founderApi.db.bulkDelete(selectedTable, ids),
    onSuccess: (data) => {
      toast.success(`${data.deleted} записей удалено`);
      setSelectedRows(new Set());
      setConfirmBulkDelete(false);
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', selectedTable] });
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'tables'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteRowMutation = useMutation({
    mutationFn: (id: string) => founderApi.db.deleteRow(selectedTable, id),
    onSuccess: () => {
      toast.success('Запись удалена');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', selectedTable] });
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'tables'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const inlineUpdateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      founderApi.db.updateRow(selectedTable, id, data),
    onSuccess: () => {
      toast.success('Обновлено');
      setInlineEdit(null);
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', selectedTable] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
      setInlineEdit(null);
    },
  });

  // ─── Derived state ─────────────────────────────────────────────────────────

  const columns = tableData?.rows[0] ? Object.keys(tableData.rows[0]) : [];
  const totalPages = tableData ? Math.ceil(tableData.total / tableData.limit) : 0;

  const pkCols = useMemo(() => {
    if (!schema) return new Set<string>();
    return new Set(schema.columns.filter((c) => c.isPrimaryKey).map((c) => c.name));
  }, [schema]);

  const canInlineEdit = useCallback(
    (col: string, value: unknown) =>
      !AUTO_FIELDS.has(col) && !pkCols.has(col) && value !== REDACTED,
    [pkCols],
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!tableData) return;
    const ids = tableData.rows.map((r) => String(r['id'] ?? ''));
    const allSelected = ids.every((id) => selectedRows.has(id));
    setSelectedRows(allSelected ? new Set() : new Set(ids));
  }, [tableData, selectedRows]);

  const handleInlineSave = useCallback(() => {
    if (!inlineEdit) return;
    inlineUpdateMut.mutate({
      id: inlineEdit.rowId,
      data: { [inlineEdit.col]: inlineEdit.value },
    });
  }, [inlineEdit, inlineUpdateMut]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-sm font-semibold text-gray-800">{selectedTable}</h3>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {tableData?.total ?? tableInfo?.rowCount ?? 0} записей
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(true)}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {bulkDeleteMutation.isPending ? 'Удаление...' : `Удалить ${selectedRows.size}`}
              </button>
            )}
            <a
              href={founderApi.db.getExportUrl(selectedTable, tenantIdFilter || undefined)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </a>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Добавить
            </button>
          </div>
        </div>
        {/* Filters row */}
        <div className="mt-2 flex items-center gap-3">
          {tableInfo?.hasTenantId && (
            <input
              type="text"
              value={tenantIdFilter}
              onChange={(e) => {
                setTenantIdFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Tenant ID..."
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-violet-400"
            />
          )}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 outline-none focus:border-violet-400"
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 transition hover:bg-gray-50"
            >
              {sortDir === 'asc' ? 'ASC' : 'DESC'}
            </button>
          </div>
        </div>
      </div>

      {/* Table body */}
      {isLoading ? (
        <div className="p-4">
          <LoadingSkeleton variant="table" rows={8} />
        </div>
      ) : (
        <>
          <div className="relative max-h-[calc(100vh-380px)] overflow-auto">
            <table className="w-max min-w-full text-xs">
              <thead className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-30 w-8 bg-gray-50 px-2 py-2">
                    <input
                      type="checkbox"
                      onChange={toggleAll}
                      checked={
                        !!tableData?.rows.length &&
                        tableData.rows.every((r) => selectedRows.has(String(r['id'] ?? '')))
                      }
                      className="rounded border-gray-300"
                    />
                  </th>
                  {columns.map((col, colIdx) => (
                    <th
                      key={col}
                      className={cn(
                        'whitespace-nowrap px-3 py-2 text-left font-mono font-medium text-gray-500',
                        colIdx === 0 && 'sticky left-8 z-30 bg-gray-50',
                      )}
                    >
                      {col}
                    </th>
                  ))}
                  <th className="sticky right-0 z-30 bg-gray-50 px-3 py-2 text-right text-xs font-medium text-gray-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData?.rows.map((row, idx) => {
                  const rowId = String(row['id'] ?? idx);
                  const isSelected = selectedRows.has(rowId);
                  const bg = isSelected ? 'bg-violet-50' : 'bg-white';
                  return (
                    <tr
                      key={rowId}
                      className={cn('hover:bg-gray-50', isSelected && 'bg-violet-50')}
                    >
                      <td className={cn('sticky left-0 z-10 w-8 px-2 py-1.5', bg)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowId)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      {columns.map((col, colIdx) => {
                        const isEditing =
                          inlineEdit?.rowId === rowId && inlineEdit?.col === col;
                        return (
                          <td
                            key={col}
                            className={cn(
                              'max-w-[250px] truncate whitespace-nowrap px-3 py-1.5 font-mono text-gray-700',
                              colIdx === 0 && cn('sticky left-8 z-10', bg),
                              canInlineEdit(col, row[col]) &&
                                !isEditing &&
                                'cursor-pointer',
                            )}
                            onDoubleClick={() => {
                              if (!canInlineEdit(col, row[col])) return;
                              const v = row[col];
                              setInlineEdit({
                                rowId,
                                col,
                                value:
                                  v == null
                                    ? ''
                                    : typeof v === 'object'
                                      ? JSON.stringify(v)
                                      : String(v),
                              });
                            }}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                value={inlineEdit.value}
                                onChange={(e) =>
                                  setInlineEdit({ ...inlineEdit, value: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleInlineSave();
                                  }
                                  if (e.key === 'Escape') {
                                    skipBlurRef.current = true;
                                    setInlineEdit(null);
                                  }
                                }}
                                onBlur={() => {
                                  if (skipBlurRef.current) {
                                    skipBlurRef.current = false;
                                    return;
                                  }
                                  handleInlineSave();
                                }}
                                className="w-full rounded border border-violet-400 bg-white px-1.5 py-0.5 text-xs outline-none"
                              />
                            ) : (
                              <CellValue value={row[col]} />
                            )}
                          </td>
                        );
                      })}
                      {/* Row actions */}
                      <td className={cn('sticky right-0 z-10 whitespace-nowrap px-3 py-1.5', bg)}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditRow(row)}
                            className="rounded p-1 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600"
                            title="Редактировать"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(rowId)}
                            className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2">
            <p className="text-xs text-gray-500">Всего: {tableData?.total ?? 0}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-600">
                {page} / {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Single row delete confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Удалить запись"
        message={`Вы уверены, что хотите удалить запись #${deleteTarget}?`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        variant="danger"
        isPending={deleteRowMutation.isPending}
        onConfirm={() => deleteTarget && deleteRowMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk delete confirmation */}
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title="Массовое удаление"
        message={`Удалить ${selectedRows.size} записей?`}
        confirmLabel="Удалить все"
        cancelLabel="Отмена"
        variant="danger"
        isPending={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate([...selectedRows])}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* Edit modal */}
      {editRow !== null && (
        <RowEditModal
          tableName={selectedTable}
          row={editRow}
          onClose={() => setEditRow(null)}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <RowEditModal
          tableName={selectedTable}
          row={null}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

// Render cell value with null/redacted handling
function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>;
  }
  if (value === REDACTED) {
    return (
      <span className="flex items-center gap-1 text-gray-400">
        <Lock className="h-3 w-3" />
        REDACTED
      </span>
    );
  }
  if (typeof value === 'boolean') {
    return <span className={value ? 'text-emerald-600' : 'text-red-500'}>{String(value)}</span>;
  }
  if (typeof value === 'object') {
    return <span className="text-gray-500">{JSON.stringify(value)}</span>;
  }
  return <span>{String(value)}</span>;
}
