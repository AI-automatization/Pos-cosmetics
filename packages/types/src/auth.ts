export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WAREHOUSE = 'WAREHOUSE',
  CASHIER = 'CASHIER',
  VIEWER = 'VIEWER',
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  branchId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
