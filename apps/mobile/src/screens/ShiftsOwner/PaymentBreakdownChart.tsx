import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PaymentBreakdown } from '../../api/shifts.api';
import { Colors, Radii } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';

interface PaymentBreakdownChartProps {
  data?: PaymentBreakdown[];
}

const MOCK_DATA: PaymentBreakdown[] = [
  { method: 'cash', amount: 8_200_000, percentage: 45.3 },
  { method: 'terminal', amount: 5_400_000, percentage: 29.8 },
  { method: 'click', amount: 2_700_000, percentage: 14.9 },
  { method: 'payme', amount: 1_810_000, percentage: 10.0 },
];

const METHOD_COLORS: Record<string, string> = {
  cash: Colors.success,
  terminal: Colors.primary,
  click: Colors.purple,
  payme: Colors.orange,
  transfer: Colors.info,
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Naqd',
  terminal: 'Terminal',
  click: 'Click',
  payme: 'Payme',
  transfer: "O'tkazma",
};

export default function PaymentBreakdownChart({ data }: PaymentBreakdownChartProps) {
  const { t } = useTranslation();
  const displayData = data && data.length > 0 ? data : MOCK_DATA;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('shifts.paymentBreakdown')}</Text>
      <View style={styles.rows}>
        {displayData.map((item) => {
          const color = METHOD_COLORS[item.method] ?? Colors.textMuted;
          const label = METHOD_LABELS[item.method] ?? item.method;
          return (
            <View key={item.method} style={styles.row}>
              <View style={styles.labelBox}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.methodLabel}>{label}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${item.percentage}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <View style={styles.rightBox}>
                <Text style={[styles.pct, { color }]}>{item.percentage.toFixed(1)}%</Text>
                <Text style={styles.amt}>{formatCurrency(item.amount)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  methodLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  rightBox: {
    width: 76,
    alignItems: 'flex-end',
    gap: 1,
  },
  pct: {
    fontSize: 12,
    fontWeight: '700',
  },
  amt: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '400',
  },
});
