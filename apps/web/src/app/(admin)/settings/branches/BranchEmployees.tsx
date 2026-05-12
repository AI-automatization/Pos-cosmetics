'use client';

import { useState, useMemo } from 'react';
import {
  X, ArrowRightLeft, UserPlus, Users, ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import { useUsers } from '@/hooks/settings/useUsers';
import { useAllEmployees, useTransferEmployee } from '@/hooks/employees/useEmployees';
import { useCustomersList } from '@/hooks/customers/useDebts';
import { UserModal } from '@/components/settings/UserModal';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import type { Branch } from '@/api/branches.api';
import { ROLE_LABELS } from '@/types/user';

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
    transfer({ employeeId: selectedId, branchId: branch.id }, { onSuccess: onClose });
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
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Bekor qilish
          </button>
          <button type="button" onClick={handleConfirm} disabled={!selectedId || isPending} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
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
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{employeeName}</span> — qaysi filialga ko&apos;chirmoqchisiz?
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
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Bekor qilish
          </button>
          <button type="button" onClick={() => onConfirm(targetBranchId)} disabled={!targetBranchId || isPending} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {isPending ? "Ko'chirilmoqda..." : "Ko'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── BranchEmployees (expandable section) ─── */
interface Props {
  branch: Branch;
  allBranches: Branch[];
}

export function BranchEmployees({ branch, allBranches }: Props) {
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
                <button type="button" onClick={() => setAddEmployee(true)} className="text-blue-600 hover:underline">
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
