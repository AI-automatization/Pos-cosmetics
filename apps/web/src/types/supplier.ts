export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  phone?: string;
  company?: string;
  address?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto> & { isActive?: boolean };
