import { api } from './client';

export type PropertyType = 'OFFICE' | 'WAREHOUSE' | 'RETAIL' | 'APARTMENT';
export type PropertyStatus = 'RENTED' | 'VACANT' | 'MAINTENANCE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  status: PropertyStatus;
  rentAmount: number;
  currency: string;
  occupancyRate: number;
  tenantName?: string;
  tenantPhone?: string;
  contractStart?: string;
  contractEnd?: string;
  area?: number;
  roi?: number;
}

export interface RentalPayment {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  month: string;
  note?: string;
}

export interface RealEstateStats {
  totalProperties: number;
  rented: number;
  vacant: number;
  maintenance: number;
  totalMonthlyRent: number;
  currency: string;
  overduePayments: number;
  averageRoi: number;
}

export const realEstateApi = {
  getProperties: async (): Promise<Property[]> => {
    const { data } = await api.get<Property[]>('/realestate/properties');
    return data;
  },

  getProperty: async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/realestate/properties/${id}`);
    return data;
  },

  getStats: async (): Promise<RealEstateStats> => {
    const { data } = await api.get<RealEstateStats>('/realestate/stats');
    return data;
  },

  getRentalPayments: async (propertyId: string): Promise<RentalPayment[]> => {
    const { data } = await api.get<RentalPayment[]>(
      `/realestate/properties/${propertyId}/payments`,
    );
    return data;
  },

  getAllPayments: async (status?: PaymentStatus): Promise<RentalPayment[]> => {
    const { data } = await api.get<RentalPayment[]>('/realestate/payments', {
      params: { status },
    });
    return data;
  },
};
