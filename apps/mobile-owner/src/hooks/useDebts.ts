import { useQuery } from '@tanstack/react-query';
import { debtsApi } from '../api/debts.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';

export function useDebts() {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const summary = useQuery({
    queryKey: QUERY_KEYS.debts.summary(selectedBranchId),
    queryFn: () => debtsApi.getSummary(selectedBranchId),
  });

  const agingReport = useQuery({
    queryKey: QUERY_KEYS.debts.agingReport(selectedBranchId),
    queryFn: () => debtsApi.getAgingReport(selectedBranchId),
  });

  const customers = useQuery({
    queryKey: QUERY_KEYS.debts.customers(selectedBranchId),
    queryFn: () => debtsApi.getCustomers({ branchId: selectedBranchId }),
  });

  return { summary, agingReport, customers };
}
