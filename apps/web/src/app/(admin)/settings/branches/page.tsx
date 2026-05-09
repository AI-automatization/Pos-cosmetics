'use client';

import { useState, useMemo } from 'react';
import {
  Building2, Plus, Pencil, Trash2, CheckCircle, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useBranches, useDeactivateBranch } from '@/hooks/settings/useBranches';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { Branch } from '@/api/branches.api';
import { BranchModal } from './BranchModal';
import { BranchEmployees } from './BranchEmployees';

/* ─── Delete confirmation modal ─── */
function DeleteConfirmModal({
  branchName,
  onConfirm,
  onClose,
  isPending,
}: {
  branchName: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Filialni o&apos;chirish</h3>
            <p className="text-sm text-gray-500">Bu amalni qaytarib bo&apos;lmaydi</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-700">
          <span className="font-semibold">&quot;{branchName}&quot;</span> filialni o&apos;chirmoqchimisiz?
          Filialdagi xodimlar va mijozlar bog&apos;liqligini yo&apos;qotadi.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Bekor qilish
          </button>
          <button type="button" onClick={onConfirm} disabled={isPending} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
            {isPending ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 5;

/* ─── Main page ─── */
export default function BranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const { mutate: deactivate, isPending: deactivating } = useDeactivateBranch();
  const [modal, setModal] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil((branches?.length ?? 0) / PAGE_SIZE);
  const paginatedBranches = useMemo(
    () => (branches ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [branches, page],
  );

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Filiallar</h1>
          <p className="text-sm text-gray-500">Do&apos;kon filiallarini va xodimlarini boshqarish</p>
        </div>
        <button
          onClick={() => setModal({ open: true, branch: null })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Filial qo&apos;shish
        </button>
      </div>

      {!branches?.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16">
          <Building2 className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Hali filial yo&apos;q</p>
          <p className="mt-1 text-xs text-gray-400">Yuqoridagi tugmani bosib yangi filial qo&apos;shing</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedBranches.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center px-5 py-4">
                <div className="flex flex-1 min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    {b.address && (
                      <p className="truncate text-xs text-gray-500">{b.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {b.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      <XCircle className="h-3 w-3" /> Nofaol
                    </span>
                  )}
                  <button
                    onClick={() => setModal({ open: true, branch: b })}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Tahrirlash"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(b)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="O'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <BranchEmployees branch={b} allBranches={branches ?? []} />
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, branches?.length ?? 0)} / {branches?.length ?? 0} filial
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={cn(
                      'min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium',
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100',
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <BranchModal
          branch={modal.branch}
          onClose={() => setModal({ open: false, branch: null })}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          branchName={deleteTarget.name}
          isPending={deactivating}
          onConfirm={() => {
            deactivate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
