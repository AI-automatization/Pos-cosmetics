import { EmployeeRole } from '../../../api/employees.api';

export interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  passportId: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hireDate: string;
  role: EmployeeRole;
  branchId: string;
  login: string;
  password: string;
  passwordConfirm: string;
  hasPosAccess: boolean;
  hasAdminAccess: boolean;
  hasReportsAccess: boolean;
}

export type SetField = <K extends keyof FormState>(key: K, val: FormState[K]) => void;
