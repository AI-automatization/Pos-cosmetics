'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2, Plus, Pencil, Trash2, X, CheckCircle, XCircle,
  UserPlus, Users, ChevronDown, ChevronUp, AlertTriangle, ArrowRightLeft,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useBranches, useCreateBranch, useUpdateBranch, useDeactivateBranch } from '@/hooks/settings/useBranches';
import { useUsers } from '@/hooks/settings/useUsers';
import { useAllEmployees, useTransferEmployee } from '@/hooks/employees/useEmployees';
import { useCustomersList } from '@/hooks/customers/useDebts';
import { UserModal } from '@/components/settings/UserModal';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import type { Branch } from '@/api/branches.api';
import { ROLE_LABELS } from '@/types/user';

const branchSchema = z.object({
  name: z.string().min(2, 'Filial nomi kamida 2 belgi'),
  address: z.string().optional(),
});
type BranchForm = z.infer<typeof branchSchema>;

/* ─── Branch create/edit modal ─── */
function BranchModal({ branch, onClose }: { branch: Branch | null; onClose: () => void }) {
  const { mutate: create, isPending: creating } = useCreateBranch();
  const { mutate: update, isPending: updating } = useUpdateBranch();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: branch?.name ?? '', address: branch?.address ?? '' },
  });

  const onSubmit = (data: BranchForm) => {
    if (branch) {
      update({ id: branch.id, dto: data }, { onSuccess: onClose });
    } else {
      create(data, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {branch ? 'Filialni tahrirlash' : 'Yangi filial'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Filial nomi <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Tashkent Yunusobod"
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20',
                errors.name ? 'border-red-400' : 'border-gray-300 focus:border-blue-500',
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Manzil</label>
            <input
              {...register('address')}
              placeholder="Yunusobod 5-mavze"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saqlanmoqda...' : branch ? 'Saqlash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
            <h3 className="text-base font-semibold text-gray-900">Filialni o'chirish</h3>
            <p className="text-sm text-gray-500">Bu amalni qaytarib bo'lmaydi</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-700">
          <span className="font-semibold">"{branchName}"</span> filialni o'chirmoqchimisiz?
          Filialdagi xodimlar va mijozlar bog'liqligini yo'qotadi.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add existing employee modal ─── */
function AddExistingEmployeeModal({
  branch,
  currentEmployeeIds,
  onClose,
}: {
  branch: Branch;
  currentEmployeeIds: string[];
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState('');
  const { data: allEmployees = [], isLoading } = useAllEmployees();
  const { mutate: transfer, isPending } = useTransferEmployee();

  const options = useMemo(
    () =>
      allEmployees
        .filter((e) => !currentEmployeeIds.includes(e.id))
        .map((e) => ({
          value: e.id,
          label: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.email || 'Noma\'lum',
          sublabel: e.email,
        })),
    [allEmployees, currentEmployeeIds],
  );

  const handleConfirm = () => {
    if (!selectedId) return;
    transfer(
      { employeeId: selectedId, branchId: branch.id },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Mavjud xodim qo&apos;shish</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{branch.name}</span> fililiga qo&apos;shmoqchi bo&apos;lgan xodimni tanlang
        </p>
        {isLoading ? (
          <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
        ) : options.length === 0 ? (
          <p className="rounded-xl bg-gray-50 py-4 text-center text-sm text-gray-400">
            Boshqa filialga qo&apos;shish mumkin bo&apos;lgan xodim yo&apos;q
          </p>
        ) : (
          <SearchableDropdown
            options={options}
            value={selectedId}
            onChange={setSelectedId}
            placeholder="Xodim tanlang..."
            searchPlaceholder="Ism yoki email bo'yicha qidirish..."
            emptyMessage="Xodim topilmadi"
          />
        )}
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId || isPending}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Transfer employee modal ─── */
function TransferModal({
  employeeName,
  currentBranchId,
  branches,
  onConfirm,
  onClose,
  isPending,
}: {
  employeeName: string;
  currentBranchId: string;
  branches: Branch[];
  onConfirm: (targetBranchId: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [targetBranchId, setTargetBranchId] = useState('');

  const branchOptions = useMemo(
    () =>
      branches
        .filter((b) => b.id !== currentBranchId && b.isActive)
        .map((b) => ({ value: b.id, label: b.name, sublabel: b.address })),
    [branches, currentBranchId],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Xodimni ko&apos;chirish</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{employeeName}</span> — qaysi filialga
          ko&apos;chirmoqchisiz?
        </p>

        <SearchableDropdown
          options={branchOptions}
          value={targetBranchId}
          onChange={setTargetBranchId}
          placeholder="Filial tanlang..."
          searchPlaceholder="Filial qidirish..."
          emptyMessage="Boshqa aktiv filial yo'q"
        />

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() => onConfirm(targetBranchId)}
            disabled={!targetBranchId || isPending}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Ko'chirilmoqda..." : "Ko'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Branch employees + customers ─── */
function BranchDetails({ branch, allBranches }: { branch: Branch; allBranches: Branch[] }) {
  const [expanded, setExpanded] = useState(false);
  const [addEmployee, setAddEmployee] = useState(false);
  const [addExisting, setAddExisting] = useState(false);
  const [transferTarget, setTransferTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: users = [], isLoading: usersLoading } = useUsers(expanded ? branch.id : undefined);
  const { data: customers = [], isLoading: customersLoading } = useCustomersList(
    undefined,
    expanded ? branch.id : undefined,
  );
  const { mutate: transferEmployee, isPending: isTransferring } = useTransferEmployee();

  const handleTransferConfirm = (targetBranchId: string) => {
    if (!transferTarget) return;
    transferEmployee(
      { employeeId: transferTarget.id, branchId: targetBranchId },
      { onSuccess: () => setTransferTarget(null) },
    );
  };

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center justify-between bg-gray-50/60 px-5 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Xodimlar va mijozlar</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddExisting(true)}
            className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Mavjud xodim
          </button>
          <button
            type="button"
            onClick={() => setAddEmployee(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Yangi xodim
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 pt-3 space-y-4">
          {/* Employees */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Xodimlar ({users.length})
            </p>
            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
              </div>
            ) : users.length === 0 ? (
              <p className="py-2 text-sm text-gray-400">
                Bu filialda xodim yo&apos;q.{' '}
                <button
                  type="button"
                  onClick={() => setAddEmployee(true)}
                  className="text-blue-600 hover:underline"
                >
                  Qo&apos;shish
                </button>
              </p>
            ) : (
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {users.map((u) => {
                  const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Noma\'lum';
                  return (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900">{fullName}</span>
                        <span className="ml-2 text-xs text-gray-400">{u.email}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            u.role === 'WAREHOUSE'
                              ? 'bg-amber-100 text-amber-700'
                              : u.role === 'CASHIER'
                                ? 'bg-green-100 text-green-700'
                                : u.role === 'MANAGER'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                        {allBranches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTransferTarget({ id: u.id, name: fullName })}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                            title="Ko'chirish"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customers */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Mijozlar ({customers.length})
            </p>
            {customersLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
              </div>
            ) : customers.length === 0 ? (
              <p className="py-2 text-sm text-gray-400">Bu filialda mijoz yo&apos;q</p>
            ) : (
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {customers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <span className="text-xs font-semibold text-gray-600">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        {c.phone && <p className="text-xs text-gray-400">+{c.phone}</p>}
                      </div>
                    </div>
                    {c.debtBalance > 0 && (
                      <span className="text-xs font-medium text-orange-600">
                        {c.debtBalance.toLocaleString()} so&apos;m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {addEmployee && (
        <UserModal
          initialBranchId={branch.id}
          lockBranchId
          onClose={() => setAddEmployee(false)}
        />
      )}

      {addExisting && (
        <AddExistingEmployeeModal
          branch={branch}
          currentEmployeeIds={users.map((u) => u.id)}
          onClose={() => setAddExisting(false)}
        />
      )}

      {transferTarget && (
        <TransferModal
          employeeName={transferTarget.name}
          currentBranchId={branch.id}
          branches={allBranches}
          onConfirm={handleTransferConfirm}
          onClose={() => setTransferTarget(null)}
          isPending={isTransferring}
        />
      )}
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

              <BranchDetails branch={b} allBranches={branches ?? []} />
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
