import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';
import { formatFullAmount } from './pnl.utils';

interface WaterfallRowProps {
  readonly label: string;
  readonly amount: number;
  readonly type: 'positive' | 'negative' | 'subtotal' | 'total';
  readonly suffix?: string;
  readonly isLast?: boolean;
}

function WaterfallRow({ label, amount, type, suffix, isLast = false }: WaterfallRowProps) {
  const isSubtotalOrTotal = type === 'subtotal' || type === 'total';
  const amountColor =
    type === 'negative'
      ? Colors.danger
      : type === 'total'
        ? amount >= 0
          ? Colors.success
          : Colors.danger
        : type === 'subtotal'
          ? Colors.primary
          : Colors.success;

  const sign = amount >= 0 ? '+' : '';

  return (
    <View
      style={[
        styles.waterfallRow,
        isSubtotalOrTotal && styles.waterfallSubtotalRow,
        !isLast && styles.waterfallRowBorder,
      ]}
    >
      <Text
        style={[
          styles.waterfallLabel,
          isSubtotalOrTotal && styles.waterfallLabelBold,
        ]}
      >
        {isSubtotalOrTotal ? '= ' : '  '}
        {label}
        {suffix ? ` (${suffix})` : ''}
      </Text>
      <Text
        style={[
          styles.waterfallAmount,
          { color: amountColor },
          isSubtotalOrTotal && styles.waterfallAmountBold,
        ]}
      >
        {sign}{formatFullAmount(amount)}
      </Text>
    </View>
  );
}

interface PnLWaterfallProps {
  readonly revenue: number;
  readonly cogs: number;
  readonly grossProfit: number;
  readonly grossMarginPct: number;
  readonly totalExpenses: number;
  readonly netProfit: number;
}

export default function PnLWaterfall({
  revenue, cogs, grossProfit, grossMarginPct, totalExpenses, netProfit,
}: PnLWaterfallProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Foyda tarkibi</Text>
      <View style={styles.waterfallCard}>
        <WaterfallRow label="Daromad" amount={revenue} type="positive" />
        <WaterfallRow label="Tan narxi (COGS)" amount={-cogs} type="negative" />
        <WaterfallRow
          label="Yalpi foyda"
          amount={grossProfit}
          type="subtotal"
          suffix={`${grossMarginPct.toFixed(1)}%`}
        />
        <WaterfallRow label="Xarajatlar" amount={-totalExpenses} type="negative" />
        <WaterfallRow label="Sof foyda" amount={netProfit} type="total" isLast />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  waterfallCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  waterfallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  waterfallRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  waterfallSubtotalRow: {
    backgroundColor: Colors.bgSubtle,
  },
  waterfallLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  waterfallLabelBold: {
    fontWeight: '700',
  },
  waterfallAmount: {
    ...Typography.bodyMedium,
    textAlign: 'right',
  },
  waterfallAmountBold: {
    fontWeight: '700',
    fontSize: 15,
  },
});
