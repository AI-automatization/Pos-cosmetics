import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Employee, EmployeeStatus } from '../../../../api/employees.api';
import { Colors, Radii, Typography } from '../../../../config/theme';

// ─── StatusBadge (mahalliy) ───────────────────────────────────────────────────

interface StatusBadgeProps {
  readonly status: EmployeeStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<EmployeeStatus, { label: string; color: string; bg: string }> = {
    active:   { label: '● FAOL',              color: Colors.success, bg: Colors.successLight },
    inactive: { label: '● NOFAOL',            color: Colors.warning, bg: Colors.warningLight },
    fired:    { label: '● ISHDAN CHIQARILGAN', color: Colors.danger,  bg: Colors.dangerLight },
  };
  const c = config[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

// ─── EmployeeAvatarSection ────────────────────────────────────────────────────

interface EmployeeAvatarSectionProps {
  readonly employee: Employee;
}

export default function EmployeeAvatarSection({ employee }: EmployeeAvatarSectionProps) {
  return (
    <View style={styles.avatarSection}>
      <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
        <Text style={styles.avatarText}>
          {employee.firstName[0]?.toUpperCase()}{employee.lastName[0]?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.fullName}>{employee.fullName}</Text>
      <Text style={styles.roleText}>{employee.role} · {employee.branchName}</Text>
      <StatusBadge status={employee.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  fullName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
