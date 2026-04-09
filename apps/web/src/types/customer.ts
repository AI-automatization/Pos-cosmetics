// Customer & Nasiya (Qarz) domain types

export type CustomerGender = 'MALE' | 'FEMALE';

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  address?: string | null;
  gender?: CustomerGender | null;
  debtLimit: number;
  debtBalance: number;
  isBlocked: boolean;
  hasOverdue: boolean;
  overdueAmount: number;
  totalPurchases: number;
  lastVisitAt: string | null;
  notes?: string | null;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  gender?: CustomerGender;
  debtLimit?: number;
  notes?: string;
  branchId?: string;
}

export interface CustomerSearchResult {
  found: boolean;
  customer?: Customer;
}
