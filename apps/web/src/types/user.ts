// User & Roles domain types

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  tenantId: string;
}

export interface CreateUserDto {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>> & {
  isActive?: boolean;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Egasi',
  ADMIN: 'Admin',
  MANAGER: 'Menejer',
  CASHIER: 'Kassir',
  VIEWER: "Ko'ruvchi",
};

export const ROLE_ORDER: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'VIEWER'];
