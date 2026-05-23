import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MonthlyProfitCardProps {
  readonly revenue: number;
  readonly cogs: number;
  readonly grossProfit: number;
  readonly totalExpenses: number;
  readonly netProfit: number;
  readonly loading?: boolean;
}

interface BreakdownRowProps {
  readonly label: string;
  readonly value: string;
  readonly color: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const C = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  border:    '#E5E7EB',
  primary:   '#2563EB',
  primaryBg: '#EFF6FF',
  green:     '#16A34A',
  red:       '#DC2626',
  orange:    '#D97706',
  gray:      '#374151',
  labelMuted:'#6B7280',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

// ─── BreakdownRow ─────────────────────────────────────────────────────────────

function BreakdownRow({ label, value, color }: BreakdownRowProps): React.ReactElement {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={[styles.breakdownValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── MonthlyProfitCard ────────────────────────────────────────────────────────

function MonthlyProfitCard({
  revenue,
  cogs,
  totalExpenses,
  netProfit,
  loading = false,
}: MonthlyProfitCardProps): React.ReactElement {
  const isNegative = netProfit < 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Oylik moliyaviy xulosa</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>30 kun</Text>
          </View>
        </View>
        {loading && (
          <ActivityIndicator
            size="small"
            color={C.primary}
            style={styles.loader}
          />
        )}
      </View>

      {/* Body */}
      {!loading && (
        <View style={styles.body}>
          <BreakdownRow
            label="Daromad"
            value={fmt(revenue)}
            color={C.text}
          />
          <BreakdownRow
            label="Tannarx (COGS)"
            value={`-${fmt(cogs)}`}
            color={C.red}
          />
          <BreakdownRow
            label="Xarajatlar"
            value={`-${fmt(totalExpenses)}`}
            color={C.orange}
          />

          <View style={styles.divider} />

          {/* Net profit satri */}
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>SOF FOYDA</Text>
            <Text style={[styles.netValue, { color: isNegative ? C.red : C.green }]}>
              {fmt(netProfit)}
            </Text>
          </View>

          {/* Ogohlantirish banner */}
          {isNegative && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={14} color={C.red} />
              <Text style={styles.warningText}>
                Sof foyda manfiy — xarajatlarni tekshiring
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default React.memo(MonthlyProfitCard);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    // iOS shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  badge: {
    backgroundColor: C.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },
  loader: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: C.labelMuted,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.gray,
    letterSpacing: 0.5,
  },
  netValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: C.red,
    flex: 1,
    marginLeft: 6,
  },
});
