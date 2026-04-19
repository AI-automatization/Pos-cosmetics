import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RentalPayment, PaymentStatus } from '@/api/realestate.api';
import { formatCurrency, formatDateTime } from '@/utils/format';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_BAR_HEIGHT = 60;
const MIN_BAR_HEIGHT = 8;
const LAST_N = 6;

const STATUS_COLOR: Record<PaymentStatus, string> = {
  PAID: '#16A34A',
  PENDING: '#D97706',
  OVERDUE: '#DC2626',
};

const STATUS_BG: Record<PaymentStatus, string> = {
  PAID: '#D1FAE5',
  PENDING: '#FEF3C7',
  OVERDUE: '#FEE2E2',
};

const STATUS_ICON: Record<PaymentStatus, 'checkmark-circle-outline' | 'time-outline' | 'alert-circle-outline'> = {
  PAID: 'checkmark-circle-outline',
  PENDING: 'time-outline',
  OVERDUE: 'alert-circle-outline',
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PAID: "To'langan",
  PENDING: 'Kutilmoqda',
  OVERDUE: 'Muddati o\'tgan',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortenAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}K`;
  }
  return String(amount);
}

// ─── MonthlyChart ─────────────────────────────────────────────────────────────

interface MonthlyChartProps {
  readonly payments: RentalPayment[];
}

export function MonthlyChart({ payments }: MonthlyChartProps): React.JSX.Element {
  const slice = payments.slice(-LAST_N);

  if (slice.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>To'lov tarixi</Text>
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>Ma'lumot yo'q</Text>
        </View>
      </View>
    );
  }

  const maxAmount = Math.max(...slice.map((p) => p.amount), 1);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>To'lov tarixi</Text>
      <View style={styles.barsRow}>
        {slice.map((payment) => {
          const rawHeight = (payment.amount / maxAmount) * MAX_BAR_HEIGHT;
          const barHeight = Math.max(rawHeight, MIN_BAR_HEIGHT);
          const color = STATUS_COLOR[payment.status];

          return (
            <View key={payment.id} style={styles.barColumn}>
              <Text style={[styles.barAmountLabel, { color }]}>
                {shortenAmount(payment.amount)}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: barHeight, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.barMonthLabel} numberOfLines={1}>
                {payment.month}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── PaymentHistoryRow ────────────────────────────────────────────────────────

interface PaymentHistoryRowProps {
  readonly item: RentalPayment;
}

export function PaymentHistoryRow({ item }: PaymentHistoryRowProps): React.JSX.Element {
  const color = STATUS_COLOR[item.status];
  const bgColor = STATUS_BG[item.status];
  const iconName = STATUS_ICON[item.status];

  return (
    <View style={styles.rowCard}>
      {/* Left: status circle */}
      <View style={[styles.statusCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={18} color={color} />
      </View>

      {/* Center: month + dates */}
      <View style={styles.rowCenter}>
        <Text style={styles.rowMonth}>{item.month}</Text>
        <Text style={styles.rowDue}>{formatDateTime(item.dueDate)}</Text>
        {item.paidDate ? (
          <Text style={styles.rowPaid}>
            {'✓ ' + formatDateTime(item.paidDate)}
          </Text>
        ) : null}
      </View>

      {/* Right: amount + status */}
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <Text style={[styles.rowStatusLabel, { color }]}>
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // MonthlyChart
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: MAX_BAR_HEIGHT + 32,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barAmountLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  barTrack: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: MAX_BAR_HEIGHT,
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barMonthLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyWrapper: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // PaymentHistoryRow
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginHorizontal: 16,
  },
  statusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowCenter: {
    flex: 1,
    gap: 2,
  },
  rowMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  rowDue: {
    fontSize: 12,
    color: '#6B7280',
  },
  rowPaid: {
    fontSize: 12,
    color: '#16A34A',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 8,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  rowStatusLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
