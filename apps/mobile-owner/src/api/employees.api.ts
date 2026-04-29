import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

// ─── Enums / union types ─────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'inactive' | 'fired';
export type EmployeeRole = 'CASHIER' | 'MANAGER' | 'ADMIN' | 'WAREHOUSE';

// ─── Existing interfaces (performance / suspicious) ──────────────────────────

export interface SuspiciousActivityAlert {
  readonly id: string;
  readonly type: 'EXCESSIVE_VOIDS' | 'LARGE_DISCOUNT' | 'RAPID_REFUNDS' | 'OFF_HOURS_ACTIVITY';
  readonly description: string;
  readonly occurredAt: string;
  readonly severity: 'low' | 'medium' | 'high';
}

export interface EmployeePerformance {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly role: string;
  readonly branchName: string;
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly avgOrderValue: number;
  readonly totalRefunds: number;
  readonly refundRate: number;
  readonly totalVoids: number;
  readonly totalDiscounts: number;
  readonly discountRate: number;
  readonly suspiciousActivityCount: number;
  readonly alerts: SuspiciousActivityAlert[];
}

// ─── Full employee profile (bio + credentials) ───────────────────────────────

export interface Employee {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly email: string;
  readonly role: EmployeeRole;
  readonly branchId: string;
  readonly branchName: string;
  readonly status: EmployeeStatus;
  readonly photoUrl: string | null;
}

// ─── Create / update DTOs ────────────────────────────────────────────────────

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: EmployeeRole;
  phone?: string;
}

export interface UpdateEmployeeStatusDto {
  status: EmployeeStatus;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface EmployeeParams {
  branchId?: string | null;
  period?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SuspiciousParams extends EmployeeParams {
  severity?: 'low' | 'medium' | 'high';
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const employeesApi = {
  // List all employees (full profiles — for employee list screen)
  async getAll(branchId?: string | null): Promise<Employee[]> {
    const { data } = await apiClient.get<Employee[]>(ENDPOINTS.EMPLOYEES, {
      params: { branch_id: branchId ?? undefined },
    });
    return data;
  },

  // Get single employee full profile
  async getById(id: string): Promise<Employee> {
    const { data } = await apiClient.get<Employee>(`${ENDPOINTS.EMPLOYEES}/${id}`);
    return data;
  },

  // Create new employee (with login + password + permissions)
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const { data } = await apiClient.post<Employee>(ENDPOINTS.EMPLOYEES, dto);
    return data;
  },

  // Update employee status (active / inactive / fired)
  async updateStatus(id: string, status: EmployeeStatus): Promise<Employee> {
    const { data } = await apiClient.patch<Employee>(`${ENDPOINTS.EMPLOYEES}/${id}/status`, { status });
    return data;
  },

  // Revoke POS (mobile cashier) access
  async revokePosAccess(id: string): Promise<Employee> {
    const { data } = await apiClient.patch<Employee>(`${ENDPOINTS.EMPLOYEES}/${id}/pos-access`, {
      hasPosAccess: false,
    });
    return data;
  },

  // Grant POS access
  async grantPosAccess(id: string): Promise<Employee> {
    const { data } = await apiClient.patch<Employee>(`${ENDPOINTS.EMPLOYEES}/${id}/pos-access`, {
      hasPosAccess: true,
    });
    return data;
  },

  // Delete employee permanently
  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.EMPLOYEES}/${id}`);
  },

  // Performance data (existing)
  async getPerformance(params: EmployeeParams): Promise<EmployeePerformance[]> {
    const { data } = await apiClient.get<EmployeePerformance[]>(ENDPOINTS.EMPLOYEES_PERFORMANCE, {
      params: {
        branch_id: params.branchId ?? undefined,
        period: params.period,
        from_date: params.fromDate,
        to_date: params.toDate,
      },
    });
    return data;
  },

  // Single employee performance
  async getPerformanceById(id: string, params: EmployeeParams): Promise<EmployeePerformance> {
    const { data } = await apiClient.get<EmployeePerformance>(`${ENDPOINTS.EMPLOYEES}/${id}/performance`, {
      params: { from_date: params.fromDate, to_date: params.toDate, period: params.period },
    });
    return data;
  },

  // Suspicious activity (existing)
  async getSuspiciousActivity(params: SuspiciousParams): Promise<SuspiciousActivityAlert[]> {
    const { data } = await apiClient.get<SuspiciousActivityAlert[]>(ENDPOINTS.EMPLOYEES_SUSPICIOUS_ACTIVITY, {
      params: {
        branch_id: params.branchId ?? undefined,
        from_date: params.fromDate,
        to_date: params.toDate,
        severity: params.severity,
      },
    });
    return data;
  },

  // Employee's suspicious activity
  async getSuspiciousById(id: string): Promise<SuspiciousActivityAlert[]> {
    const { data } = await apiClient.get<SuspiciousActivityAlert[]>(
      `${ENDPOINTS.EMPLOYEES}/${id}/suspicious-activity`,
    );
    return data;
  },
};
