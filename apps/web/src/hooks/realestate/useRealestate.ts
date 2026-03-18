import { useQuery } from '@tanstack/react-query';
import { realestateApi } from '@/api/realestate.api';
import type { PaymentStatus } from '@/types/realestate';

export function useProperties() {
  return useQuery({
    queryKey: ['realestate', 'properties'],
    queryFn: realestateApi.getProperties,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['realestate', 'properties', id],
    queryFn: () => realestateApi.getProperty(id),
    enabled: !!id,
  });
}

export function useRealEstateStats() {
  return useQuery({
    queryKey: ['realestate', 'stats'],
    queryFn: realestateApi.getStats,
  });
}

export function useRentalPayments(params?: { status?: PaymentStatus; propertyId?: string }) {
  return useQuery({
    queryKey: ['realestate', 'payments', params],
    queryFn: () => realestateApi.getPayments(params),
  });
}
