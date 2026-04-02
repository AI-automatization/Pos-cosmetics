import { apiClient } from './client';
import type { Property, RentalPayment, RealEstateStats, PaymentStatus } from '@/types/realestate';

export const realestateApi = {
  getProperties() {
    return apiClient.get<Property[]>('/real-estate/properties').then((r) => r.data);
  },

  getProperty(id: string) {
    return apiClient.get<Property>(`/real-estate/properties/${id}`).then((r) => r.data);
  },

  getStats() {
    return apiClient.get<RealEstateStats>('/real-estate/stats').then((r) => r.data);
  },

  getPayments(params?: { status?: PaymentStatus; propertyId?: string }) {
    return apiClient
      .get<RentalPayment[]>('/real-estate/payments', { params })
      .then((r) => r.data);
  },

  getPropertyPayments(propertyId: string) {
    return apiClient
      .get<RentalPayment[]>(`/real-estate/properties/${propertyId}/payments`)
      .then((r) => r.data);
  },
};
