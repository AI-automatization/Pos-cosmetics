import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Employee } from '../../../../api/employees.api';
import { Colors, Typography } from '../../../../config/theme';
import Card from '../../../../components/common/Card';

// ─── AccessRow (mahalliy) ─────────────────────────────────────────────────────

interface AccessRowProps {
  readonly label: string;
  readonly granted: boolean;
}

function AccessRow({ label, granted }: AccessRowProps) {
  return (
    <View style={styles.accessRow}>
      <Ionicons
        name={granted ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={granted ? Colors.success : Colors.textMuted}
      />
      <Text style={[styles.accessLabel, !granted && styles.accessLabelOff]}>{label}</Text>
    </View>
  );
}

// ─── EmployeeAccessCard ───────────────────────────────────────────────────────

interface EmployeeAccessCardProps {
  readonly employee: Employee;
}

export default function EmployeeAccessCard({ employee }: EmployeeAccessCardProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>{t('employees.accessInfo')}</Text>
      <View style={styles.loginRow}>
        <Text style={styles.loginIcon}>👤</Text>
        <View style={styles.loginContent}>
          <Text style={styles.loginLabel}>{t('employees.login')}</Text>
          <Text style={styles.loginValue}>{employee.login}</Text>
        </View>
      </View>
      <View style={styles.accessList}>
        <AccessRow label={t('employees.posAccess')} granted={employee.hasPosAccess} />
        <AccessRow label={t('employees.adminAccess')} granted={employee.hasAdminAccess} />
        <AccessRow label={t('employees.reportsAccess')} granted={employee.hasReportsAccess} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    ...Typography.captionMedium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10,
    marginBottom: 4,
  },
  loginIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
    marginTop: 1,
  },
  loginContent: {
    flex: 1,
  },
  loginLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 1,
  },
  loginValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  accessList: {
    gap: 8,
    marginTop: 4,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  accessLabelOff: {
    color: Colors.textMuted,
  },
});
