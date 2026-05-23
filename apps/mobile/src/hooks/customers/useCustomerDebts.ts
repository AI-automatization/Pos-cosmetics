import { useQuery } from '@tanstack/react-query';
import { nasiyaApi } from '../../api/nasiya.api';
import type { DebtRecord } from '../../api/nasiya.api';

export function useCustomerDebts(customerId: string) {
  return useQuery<DebtRecord[]>({
    queryKey: ['nasiya', 'customer', customerId],
    queryFn: () => nasiyaApi.getByCustomer(customerId),
    staleTime: 60_000,
    enabled: customerId.length > 0,
  });
}
