export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'VIEWER';

export const ROLE_LEVEL: Record<string, number> = {
  OWNER:     5,
  ADMIN:     4,
  MANAGER:   3,
  CASHIER:   2,
  WAREHOUSE: 2,
  VIEWER:    1,
};

/** Level >= 4 — full management access */
export const ADMIN_ROLES: UserRole[] = ['OWNER', 'ADMIN'];

/** Level >= 3 — intermediate management */
export const MANAGER_ROLES: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER'];

/** Catalog CRUD — can add/edit/delete products */
export const CATALOG_EDIT_ROLES: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE'];

export function getRoleLevel(role: string | undefined): number {
  return ROLE_LEVEL[role ?? ''] ?? 1;
}

export function canEditCatalog(role: string | undefined): boolean {
  return CATALOG_EDIT_ROLES.includes(role as UserRole);
}
