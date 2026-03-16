import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RevenueData, OrdersData } from '../../api/analytics.api';
import { Colors, Radii, Shadows } from '../../config/theme';
import TrendBadge from '../../components/common/TrendBadge';

interface RevenueSummaryGridProps {
  data: RevenueData;
  orders?: OrdersData;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B UZS`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M UZS`;
  return `${amount.toLocaleString('uz-UZ')} UZS`;
}

export default function RevenueSummaryGrid({ data, orders }: RevenueSummaryGridProps) {
  const { t } = useTranslation();

  const cards = [
    { label: t('dashboard.revenueToday'), value: formatAmount(data.today), trend: data.todayTrend },
    { label: t('dashboard.revenueWeek'), value: formatAmount(data.week), trend: data.weekTrend },
    { label: t('dashboard.revenueMonth'), value: formatAmount(data.month), trend: data.monthTrend },
    {
      label: t('dashboard.orderCount'),
      value: `${(orders?.total ?? data.year).toLocaleString('uz-UZ')} ta`,
      trend: orders?.trend ?? data.yearTrend,
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <View key={card.label} style={styles.card}>
          <Text style={styles.label}>{card.label}</Text>
          <Text style={styles.amount} numberOfLines={2}>{card.value}</Text>
          <TrendBadge value={card.trend} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 16,
    gap: 6,
    ...Shadows.card,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
});
