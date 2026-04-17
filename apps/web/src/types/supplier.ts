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

export interface SupplierDetail extends Supplier {
  productSuppliers?: {
    product: {
      id: string;
      name: string;
      sku: string | null;
      sellPrice: number;
      isActive: boolean;
    };
  }[];
}
