import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, Employee, EmployeeStatus, CreateEmployeeDto } from '../../api/employees.api';
import { useBranchStore } from '../../store/branch.store';
import { DASHBOARD_REFETCH_INTERVAL } from '../../config/constants';

export function useHRData() {
  const qc = useQueryClient();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const employees = useQuery<Employee[]>({
    queryKey: ['hr-employees', selectedBranchId],
    queryFn: () => employeesApi.getAll(selectedBranchId),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeesApi.updateStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['hr-employees'] });
    },
  });

  const inviteEmployee = useMutation({
    mutationFn: (dto: CreateEmployeeDto) => employeesApi.create(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['hr-employees'] });
    },
  });

  return { employees, toggleStatus, inviteEmployee };
}
