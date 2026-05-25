import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';
import { formatFullAmount, getExpenseColor, getExpenseLabel } from './pnl.utils';

interface ExpenseItem {
  readonly category: string;
  readonly amount: number;
  readonly pct: number;
}

interface PnLExpenseBreakdownProps {
  readonly items: ExpenseItem[];
}

export default function PnLExpenseBreakdown({ items }: PnLExpenseBreakdownProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Xarajatlar taqsimoti</Text>
      <View style={styles.expenseCard}>
        {items.map((item) => (
          <View key={item.category} style={styles.expenseRow}>
            <View style={styles.expenseLeft}>
              <View
                style={[
                  styles.expenseDot,
                  { backgroundColor: getExpenseColor(item.category) },
                ]}
              />
              <Text style={styles.expenseLabel}>{getExpenseLabel(item.category)}</Text>
            </View>
            <View style={styles.expenseRight}>
              <Text style={styles.expenseAmount}>{formatFullAmount(item.amount)}</Text>
              <Text style={styles.expensePct}>{item.pct.toFixed(1)}%</Text>
            </View>
            <View style={styles.expenseBarTrack}>
              <View
                style={[
                  styles.expenseBarFill,
                  {
                    width: `${Math.min(item.pct, 100)}%`,
                    backgroundColor: getExpenseColor(item.category),
                  },
                ]}
              />
            </View>
          </View>
        ))}
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
  expenseCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 16,
    gap: 14,
    ...Shadows.card,
  },
  expenseRow: {
    gap: 6,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  expenseLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  expenseRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 18,
  },
  expenseAmount: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  expensePct: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },
  expenseBarTrack: {
    height: 6,
    backgroundColor: Colors.bgSubtle,
    borderRadius: 3,
    marginLeft: 18,
    overflow: 'hidden',
  },
  expenseBarFill: {
    height: 6,
    borderRadius: 3,
  },
});
