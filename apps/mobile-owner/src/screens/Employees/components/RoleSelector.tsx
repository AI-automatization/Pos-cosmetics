import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EmployeeRole } from '../../../api/employees.api';
import { Colors, Radii } from '../../../config/theme';

interface RoleSelectorProps {
  readonly value: EmployeeRole;
  readonly onChange: (r: EmployeeRole) => void;
}

const ROLES: { key: EmployeeRole; label: string }[] = [
  { key: 'CASHIER', label: 'Kassir' },
  { key: 'MANAGER', label: 'Menejer' },
  { key: 'ADMIN', label: 'Admin' },
  { key: 'WAREHOUSE', label: 'Omborchi' },
];

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        Lavozim <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.roleRow}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleBtn, value === r.key && styles.roleBtnActive]}
            onPress={() => onChange(r.key)}
          >
            <Text style={[styles.roleBtnText, value === r.key && styles.roleBtnTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.danger,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSubtle,
  },
  roleBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleBtnTextActive: {
    color: Colors.primary,
  },
});
