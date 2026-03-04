'use client';

import { useQuery } from '@tanstack/react-query';
import { shiftsApi } from '@/api/shifts.api';
import type { ShiftsQuery } from '@/types/shift';

export const SHIFTS_KEY = 'shifts';

export function useShifts(params: ShiftsQuery = {}) {
  return useQuery({
    queryKey: [SHIFTS_KEY, params],
    queryFn: () => shiftsApi.list(params),
    staleTime: 30_000,
  });
}
