import { useQuery } from '@tanstack/react-query';
import { shiftsApi } from '../api/shifts.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';
import { usePeriodFilter } from './usePeriodFilter';

export function useShifts(statusFilter?: 'open' | 'closed') {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const { fromDate, toDate } = usePeriodFilter('month');

  const shifts = useQuery({
    queryKey: QUERY_KEYS.shifts.list(selectedBranchId),
    queryFn: () =>
      shiftsApi.getShifts({
        branchId: selectedBranchId,
        fromDate,
        toDate,
        status: statusFilter,
      }),
  });

  const summary = useQuery({
    queryKey: QUERY_KEYS.shifts.summary(selectedBranchId),
    queryFn: () =>
      shiftsApi.getShiftSummary({
        branchId: selectedBranchId,
        fromDate,
        toDate,
      }),
  });

  return { shifts, summary };
}

export function useShiftDetail(shiftId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.shifts.detail(shiftId),
    queryFn: () => shiftsApi.getShiftById(shiftId),
    enabled: Boolean(shiftId),
  });
}
