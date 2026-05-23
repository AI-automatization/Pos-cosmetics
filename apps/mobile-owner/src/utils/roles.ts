export type OwnerAppRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'VIEWER';

export const ROLE_LEVEL: Record<string, number> = {
  OWNER:     5,
  ADMIN:     4,
  MANAGER:   3,
  CASHIER:   2,
  WAREHOUSE: 2,
  VIEWER:    1,
};

export function getRoleLevel(role: string | undefined): number {
  return ROLE_LEVEL[role ?? ''] ?? 1;
}

// Tab visibility
export function canSeeAnalytics(role: string | undefined): boolean {
  return getRoleLevel(role) >= 3; // OWNER, ADMIN, MANAGER
}

export function canSeeEmployees(role: string | undefined): boolean {
  return getRoleLevel(role) >= 4; // OWNER, ADMIN only
}

export function canSeeSystemHealth(role: string | undefined): boolean {
  return getRoleLevel(role) >= 4; // OWNER, ADMIN only
}

export function canSeeShifts(role: string | undefined): boolean {
  return getRoleLevel(role) >= 3; // OWNER, ADMIN, MANAGER
}

export function canSeeInventory(role: string | undefined): boolean {
  return getRoleLevel(role) >= 3 || role === 'WAREHOUSE';
}

// Action permissions
export function canEditData(role: string | undefined): boolean {
  return getRoleLevel(role) >= 3; // OWNER, ADMIN, MANAGER
}

export function canManageEmployees(role: string | undefined): boolean {
  return getRoleLevel(role) >= 4; // OWNER, ADMIN
}
