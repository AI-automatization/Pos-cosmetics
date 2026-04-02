import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SalesSummary } from '@raos/types';
import Card from '../../components/common/Card';
import { formatUZS, formatCompact } from '../../utils/currency';

interface RevenueCardProps {
  readonly summary: SalesSummary;
}

export default function RevenueCard({ summary }: RevenueCardProps) {
  const { t } = useTranslation();

  const avgBasket =
    summary.orders.count > 0
      ? summary.orders.grossRevenue / summary.orders.count
      : 0;

  return (
    <Card>
      <Text style={styles.label}>{t('dashboard.revenue')} — {t('common.today')}</Text>
      <Text style={styles.revenue}>{formatCompact(summary.netRevenue)}</Text>
      <Text style={styles.revenueSub}>{formatUZS(summary.netRevenue)}</Text>

      <View style={styles.row}>
        <StatBox label={t('dashboard.orders')} value={String(summary.orders.count)} />
        <StatBox label={t('dashboard.avgBasket')} value={formatCompact(avgBasket)} />
      </View>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  revenue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
  },
  revenueSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
