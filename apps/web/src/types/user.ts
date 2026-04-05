// User & Roles domain types

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'CASHIER' | 'VIEWER';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  tenantId?: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  branchId?: string;
}

export type UpdateUserDto = {
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: UserRole;
  branchId?: string;
  isActive?: boolean;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Egasi',
  ADMIN: 'Admin',
  MANAGER: 'Menejer',
  WAREHOUSE: 'Omborchi',
  CASHIER: 'Kassir',
  VIEWER: "Ko'ruvchi",
};

export const ROLE_ORDER: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER', 'VIEWER'];
