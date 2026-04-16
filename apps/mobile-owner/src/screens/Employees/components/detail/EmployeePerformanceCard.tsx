import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmployeePerformance } from '../../../../api/employees.api';
import { Colors, Radii, Typography } from '../../../../config/theme';
import Card from '../../../../components/common/Card';
import { formatCurrency } from '../../../../utils/formatCurrency';

// ─── StatBox (mahalliy) ───────────────────────────────────────────────────────

interface StatBoxProps {
  readonly label: string;
  readonly value: string;
  readonly warn?: boolean;
}

function StatBox({ label, value, warn }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, warn === true && styles.statWarn]}>{value}</Text>
    </View>
  );
}

// ─── EmployeePerformanceCard ──────────────────────────────────────────────────

interface EmployeePerformanceCardProps {
  readonly performance: EmployeePerformance;
}

export default function EmployeePerformanceCard({ performance }: EmployeePerformanceCardProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>{t('employees.performance')}</Text>
      <View style={styles.statsGrid}>
        <StatBox
          label={t('employees.orders')}
          value={String(performance.totalOrders)}
        />
        <StatBox
          label={t('employees.revenue')}
          value={formatCurrency(performance.totalRevenue)}
        />
        <StatBox
          label={t('employees.refunds')}
          value={`${performance.totalRefunds} (${performance.refundRate.toFixed(1)}%)`}
          warn={performance.refundRate > 5}
        />
        <StatBox
          label={t('employees.voids')}
          value={String(performance.totalVoids)}
          warn={performance.totalVoids > 0}
        />
        <StatBox
          label={t('employees.avgOrder')}
          value={formatCurrency(performance.avgOrderValue)}
        />
        <StatBox
          label={t('employees.discounts')}
          value={`${performance.totalDiscounts} (${performance.discountRate.toFixed(1)}%)`}
          warn={performance.discountRate > 20}
        />
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    width: '47%',
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.md,
    padding: 10,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statWarn: {
    color: Colors.danger,
  },
});
