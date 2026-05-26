import { EmployeeRole } from '../../../api/employees.api';

export interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: EmployeeRole;
  password: string;
  passwordConfirm: string;
}

export type SetField = <K extends keyof FormState>(key: K, val: FormState[K]) => void;
