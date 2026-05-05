import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Employee, EmployeeStatus } from '../../api/employees.api';
import { Colors, Radii } from '../../config/theme';

interface Props {
  employee: Employee;
  onToggleStatus: (id: string, newStatus: EmployeeStatus) => void;
  onPress: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  cashier: 'Kassir',
  manager: 'Menejer',
  admin: 'Admin',
};

const STATUS_STYLE: Record<EmployeeStatus, { bg: string; text: string; label: string }> = {
  active:   { bg: Colors.successLight, text: Colors.success, label: 'Faol' },
  inactive: { bg: Colors.warningLight, text: Colors.warning, label: 'Nofaol' },
  fired:    { bg: Colors.dangerLight,  text: Colors.danger,  label: 'Ishdan ketgan' },
};

function AvatarBadge({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export default function HREmployeeRow({ employee, onToggleStatus, onPress }: Props) {
  const statusStyle = STATUS_STYLE[employee.status] ?? STATUS_STYLE.inactive;
  const canToggle = employee.status !== 'fired';
  const newStatus: EmployeeStatus = employee.status === 'active' ? 'inactive' : 'active';

  function handleToggle() {
    Alert.alert(
      employee.status === 'active' ? 'Deaktivatsiya' : 'Aktivatsiya',
      `${employee.fullName} ni ${newStatus === 'active' ? 'faollashtirmoqchimisiz' : "o'chirmoqchimisiz"}?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Ha', onPress: () => onToggleStatus(employee.id, newStatus) },
      ],
    );
  }

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <AvatarBadge name={employee.fullName} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{employee.fullName}</Text>
        <Text style={styles.meta}>{ROLE_LABELS[employee.role] ?? employee.role} · {employee.branchName}</Text>
        {employee.email != null && <Text style={styles.email} numberOfLines={1}>{employee.email}</Text>}
      </View>

      <View style={styles.right}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
        </View>
        {canToggle && (
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: employee.status === 'active' ? Colors.warningLight : Colors.successLight }]}
            onPress={handleToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.toggleText, { color: employee.status === 'active' ? Colors.warning : Colors.success }]}>
              {employee.status === 'active' ? "O'chir" : 'Yoq'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.bgSurface,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: Colors.textWhite, fontSize: 15, fontWeight: '700' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textSecondary },
  email: { fontSize: 11, color: Colors.textMuted },
  right: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.pill },
  statusText: { fontSize: 11, fontWeight: '600' },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.sm },
  toggleText: { fontSize: 11, fontWeight: '700' },
});
