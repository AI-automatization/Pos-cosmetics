import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SuspiciousActivityAlert } from '../../../../api/employees.api';
import { Colors, Typography } from '../../../../config/theme';
import Card from '../../../../components/common/Card';

interface EmployeeSuspiciousCardProps {
  readonly alerts: SuspiciousActivityAlert[];
}

export default function EmployeeSuspiciousCard({ alerts }: EmployeeSuspiciousCardProps) {
  const { t } = useTranslation();

  if (alerts.length === 0) return null;

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>
        {`⚠️ ${t('employees.suspiciousActivity')} (${alerts.length})`}
      </Text>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alertRow}>
          <View style={[styles.alertDot, styles[`dot_${alert.severity}`]]} />
          <View style={styles.alertContent}>
            <Text style={styles.alertDesc}>{alert.description}</Text>
            <Text style={styles.alertMeta}>
              {t(`employees.${alert.type}`)} · {new Date(alert.occurredAt).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  sectionTitle: {
    ...Typography.captionMedium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  dot_high: {
    backgroundColor: Colors.danger,
  },
  dot_medium: {
    backgroundColor: Colors.warning,
  },
  dot_low: {
    backgroundColor: Colors.info,
  },
  alertContent: {
    flex: 1,
  },
  alertDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  alertMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
