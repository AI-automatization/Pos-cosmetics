// Customer & Nasiya (Qarz) domain types
// Used by T-052 (Nasiya UI) and T-053 (Nasiya management)
// Backend: T-050 (CustomerModule), T-051 (NasiyaModule)

export interface Customer {
  id: string;
  name: string;
  phone: string;
  debtBalance: number;   // Joriy qarz (so'm)
  debtLimit: number;     // Maksimal ruxsat etilgan qarz
  isBlocked: boolean;    // Yangi nasiyadan bloklangan
  hasOverdue: boolean;   // Muddati o'tgan qarzi bor
  overdueAmount: number; // Muddati o'tgan qarz summasi
  totalPurchases: number;
  lastVisitAt: string | null;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
}

export interface CustomerSearchResult {
  found: boolean;
  customer?: Customer;
}
