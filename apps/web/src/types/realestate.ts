// Real Estate domain types
// Backend: apps/api/src/realestate/ (T-140 — routes hali bo'sh, UI tayyor)

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
  area?: number;
  occupancyRate: number;
  tenantName?: string;
  tenantPhone?: string;
  contractStart?: string;
  contractEnd?: string;
  roi?: number;
  createdAt: string;
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
