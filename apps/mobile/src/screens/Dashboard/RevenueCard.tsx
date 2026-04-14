import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SalesSummary } from '@raos/types';
import Card from '../../components/common/Card';
import { formatUZS, formatCompact } from '../../utils/currency';

interface RevenueCardProps {
  readonly summary: SalesSummary;
}

interface BreakdownRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueColor: string;
  readonly bold?: boolean;
}

export default function RevenueCard({ summary }: RevenueCardProps) {
  const avgBasket =
    summary.orders.count > 0
      ? summary.orders.grossRevenue / summary.orders.count
      : 0;

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Foyda tahlili</Text>
        <Text style={styles.periodLabel}>Bugun</Text>
      </View>

      <Text style={styles.mainValue}>{formatCompact(summary.netRevenue)}</Text>
      <Text style={styles.mainSub}>{formatUZS(summary.netRevenue)}</Text>

      <View style={styles.breakdown}>
        <BreakdownRow
          label="Daromad"
          value={formatUZS(summary.orders.grossRevenue)}
          valueColor="#111827"
        />
        <BreakdownRow
          label="Chegirma"
          value={`-${formatUZS(summary.orders.totalDiscount)}`}
          valueColor="#DC2626"
        />
        <BreakdownRow
          label="Soliq"
          value={formatUZS(summary.orders.totalTax)}
          valueColor="#6B7280"
        />
        <View style={styles.divider} />
        <BreakdownRow
          label="Sof daromad"
          value={formatUZS(summary.netRevenue)}
          valueColor="#16A34A"
          bold
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="receipt-outline" size={16} color="#6B7280" />
          <Text style={styles.statValue}>{summary.orders.count}</Text>
          <Text style={styles.statLabel}>buyurtma</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={16} color="#6B7280" />
          <Text style={styles.statValue}>{formatCompact(avgBasket)}</Text>
          <Text style={styles.statLabel}>o'rtacha chek</Text>
        </View>
      </View>
    </Card>
  );
}

function BreakdownRow({ label, value, valueColor, bold = false }: BreakdownRowProps) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>
        {label}
      </Text>
      <Text
        style={[
          styles.breakdownValue,
          { color: valueColor },
          bold && styles.breakdownValueBold,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  periodLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  mainSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16,
  },
  breakdown: {
    gap: 8,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownLabelBold: {
    fontWeight: '600',
    color: '#111827',
  },
  breakdownValue: {
    fontSize: 14,
  },
  breakdownValueBold: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
});
