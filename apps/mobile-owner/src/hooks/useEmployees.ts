import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, CreateEmployeeDto, EmployeeStatus } from '../api/employees.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';
import { Period } from './usePeriodFilter';

// ─── List + performance (Employee list screen) ────────────────────────────────

export function useEmployees(period: Period = 'month') {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const performance = useQuery({
    queryKey: QUERY_KEYS.employees.performance(selectedBranchId, period),
    queryFn: () => employeesApi.getPerformance({ branchId: selectedBranchId, period }),
  });

  const suspicious = useQuery({
    queryKey: QUERY_KEYS.employees.suspicious(selectedBranchId),
    queryFn: () => employeesApi.getSuspiciousActivity({ branchId: selectedBranchId }),
  });

  return { performance, suspicious };
}

// ─── Full employee list (bio profiles) ───────────────────────────────────────

export function useEmployeeList() {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  return useQuery({
    queryKey: QUERY_KEYS.employees.list(selectedBranchId),
    queryFn: () => employeesApi.getAll(selectedBranchId),
  });
}

// ─── Single employee detail ───────────────────────────────────────────────────

export function useEmployee(id: string) {
  const profile = useQuery({
    queryKey: QUERY_KEYS.employees.profile(id),
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });

  const performance = useQuery({
    queryKey: QUERY_KEYS.employees.detail(id),
    queryFn: () => employeesApi.getPerformanceById(id, { period: 'month' }),
    enabled: !!id,
  });

  const suspicious = useQuery({
    queryKey: [...QUERY_KEYS.employees.detail(id), 'suspicious'],
    queryFn: () => employeesApi.getSuspiciousById(id),
    enabled: !!id,
  });

  return { profile, performance, suspicious };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmployeeDto) => employeesApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeesApi.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees.profile(id) });
      void queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
    },
  });
}

export function useRevokePosAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.revokePosAccess(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees.profile(id) });
    },
  });
}

export function useGrantPosAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.grantPosAccess(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees.profile(id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
