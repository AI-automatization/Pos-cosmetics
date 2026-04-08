import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Employee } from '../../../../api/employees.api';
import { Colors, Typography } from '../../../../config/theme';
import Card from '../../../../components/common/Card';

// ─── InfoRow (mahalliy) ───────────────────────────────────────────────────────

interface InfoRowProps {
  readonly icon: string;
  readonly label: string;
  readonly value: string | null;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── EmployeeBioCard ──────────────────────────────────────────────────────────

interface EmployeeBioCardProps {
  readonly employee: Employee;
}

export default function EmployeeBioCard({ employee }: EmployeeBioCardProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>{t('employees.bio')}</Text>
      <InfoRow icon="📞" label={t('employees.phone')} value={employee.phone} />
      <InfoRow icon="📧" label={t('employees.email')} value={employee.email} />
      <InfoRow icon="🎂" label={t('employees.dob')} value={employee.dateOfBirth} />
      <InfoRow icon="🪪" label={t('employees.passport')} value={employee.passportId} />
      <InfoRow icon="🏠" label={t('employees.address')} value={employee.address} />
      <InfoRow icon="📅" label={t('employees.hireDate')} value={employee.hireDate} />
      <InfoRow icon="🏢" label={t('employees.branch')} value={employee.branchName} />
      {employee.emergencyContactName && (
        <>
          <View style={styles.separator} />
          <Text style={styles.emergencyTitle}>{t('employees.emergencyContact')}</Text>
          <InfoRow icon="👤" label={t('employees.contactName')} value={employee.emergencyContactName} />
          <InfoRow icon="📞" label={t('employees.contactPhone')} value={employee.emergencyContactPhone} />
        </>
      )}
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
    marginTop: 1,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4,
  },
});
