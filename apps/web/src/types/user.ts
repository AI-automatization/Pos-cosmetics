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
  shifts?: { id: string; status: string; openedAt: string; closedAt: string | null }[];
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

// i18n key map for role labels — use with t()
export const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  OWNER: 'roles.owner',
  ADMIN: 'roles.adminLabel',
  MANAGER: 'roles.managerLabel',
  WAREHOUSE: 'roles.warehouseLabel',
  CASHIER: 'roles.cashierLabel',
  VIEWER: 'roles.viewerLabel',
};

/** @deprecated Use ROLE_LABEL_KEYS with t() instead */
export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Egasi',
  ADMIN: 'Admin',
  MANAGER: 'Menejer',
  WAREHOUSE: 'Omborchi',
  CASHIER: 'Kassir',
  VIEWER: "Ko'ruvchi",
};

export const ROLE_ORDER: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER', 'VIEWER'];
