export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Analytics: undefined;
  Shifts: undefined;
  Inventory: undefined;
  Employees: undefined;
  Settings: undefined;
  SystemHealth: undefined;
  Alerts: undefined; // hidden tab — accessible via bell icon in header
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Inventory: undefined;
  Debts: undefined;
};

export type ShiftsStackParamList = {
  ShiftList: undefined;
  ShiftDetail: { shiftId: string };
};

export type AlertsStackParamList = {
  AlertList: undefined;
  AlertDetail: { alertId: string };
};

export type EmployeesStackParamList = {
  EmployeeList: undefined;
  EmployeeDetail: { employeeId: string; employeeName: string };
  AddEmployee: undefined;
};
