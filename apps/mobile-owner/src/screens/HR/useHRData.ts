import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, Employee, EmployeeStatus, CreateEmployeeDto } from '../../api/employees.api';
import { useBranchStore } from '../../store/branch.store';
import { DASHBOARD_REFETCH_INTERVAL } from '../../config/constants';

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', firstName: 'Jasur', lastName: 'Toshmatov', fullName: 'Jasur Toshmatov', phone: '+998901234567', email: 'jasur@example.com', dateOfBirth: '1995-03-15', passportId: 'AA1234567', address: 'Toshkent', hireDate: '2024-01-10', role: 'cashier', branchId: 'b1', branchName: 'Chilonzor', status: 'active', login: 'jasur', photoUrl: null, hasPosAccess: true, hasAdminAccess: false, hasReportsAccess: false, emergencyContactName: null, emergencyContactPhone: null },
  { id: 'e2', firstName: 'Malika', lastName: 'Yusupova', fullName: 'Malika Yusupova', phone: '+998901234568', email: 'malika@example.com', dateOfBirth: '1998-07-22', passportId: 'AB7654321', address: 'Toshkent', hireDate: '2024-03-01', role: 'cashier', branchId: 'b2', branchName: 'Yunusabad', status: 'active', login: 'malika', photoUrl: null, hasPosAccess: true, hasAdminAccess: false, hasReportsAccess: false, emergencyContactName: null, emergencyContactPhone: null },
  { id: 'e3', firstName: 'Sherzod', lastName: 'Karimov', fullName: 'Sherzod Karimov', phone: '+998901234569', email: null, dateOfBirth: null, passportId: null, address: null, hireDate: '2023-11-15', role: 'manager', branchId: 'b1', branchName: 'Chilonzor', status: 'active', login: 'sherzod', photoUrl: null, hasPosAccess: true, hasAdminAccess: true, hasReportsAccess: true, emergencyContactName: null, emergencyContactPhone: null },
  { id: 'e4', firstName: 'Nilufar', lastName: 'Xasanova', fullName: 'Nilufar Xasanova', phone: '+998901234570', email: 'nilufar@example.com', dateOfBirth: '2000-01-05', passportId: null, address: null, hireDate: '2025-02-01', role: 'cashier', branchId: 'b3', branchName: 'Sergeli', status: 'inactive', login: 'nilufar', photoUrl: null, hasPosAccess: false, hasAdminAccess: false, hasReportsAccess: false, emergencyContactName: null, emergencyContactPhone: null },
];

export function useHRData() {
  const qc = useQueryClient();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const employees = useQuery<Employee[]>({
    queryKey: ['hr-employees', selectedBranchId],
    queryFn: async () => {
      try {
        const data = await employeesApi.getAll(selectedBranchId);
        if (data.length > 0) return data;
        return MOCK_EMPLOYEES;
      } catch {
        return MOCK_EMPLOYEES;
      }
    },
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
