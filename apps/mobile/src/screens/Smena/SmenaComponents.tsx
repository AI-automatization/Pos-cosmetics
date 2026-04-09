import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:        '#F5F5F7',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#F3F4F6',
  primary:   '#5B5BD6',
  green:     '#10B981',
  red:       '#EF4444',
  orange:    '#F59E0B',
};

// ─── Types ─────────────────────────────────────────────
export interface ShiftRecord {
  id: string;
  cashier: string;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  closingCash: number | null;
  totalRevenue: number;
  totalOrders: number;
  cashAmount: number;
  cardAmount: number;
  nasiyaAmount: number;
  expenses: number;
}

// ─── Utils ─────────────────────────────────────────────
export function fmt(n: number | null | undefined) { return (n ?? 0).toLocaleString('ru-RU'); }

// ─── Stat box ──────────────────────────────────────────
export function StatBox({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: string;
  icon: MCIconName;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub != null ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Detail row ────────────────────────────────────────
export function DetailRow({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: MCIconName;
}) {
  return (
    <View style={styles.detailRow}>
      {icon !== undefined ? (
        <MaterialCommunityIcons name={icon} size={16} color={C.muted} style={{ marginRight: 8 }} />
      ) : (
        <View style={styles.detailDot} />
      )}
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor !== undefined ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

// ─── History card ──────────────────────────────────────
export function HistoryCard({ shift }: { shift: ShiftRecord }) {
  const netRevenue = shift.totalRevenue - shift.expenses;
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.historyDate}>{shift.openedAt} — {shift.closedAt}</Text>
          <Text style={styles.historyCashier}>{shift.cashier}</Text>
        </View>
        <View style={styles.historyBadge}>
          <Text style={styles.historyBadgeText}>Yopilgan</Text>
        </View>
      </View>
      <View style={styles.historyStats}>
        <View style={styles.historyStat}>
          <Text style={styles.historyStatValue}>{shift.totalOrders} ta</Text>
          <Text style={styles.historyStatLabel}>Savdolar</Text>
        </View>
        <View style={styles.historyDivider} />
        <View style={styles.historyStat}>
          <Text style={styles.historyStatValue}>{fmt(shift.totalRevenue)}</Text>
          <Text style={styles.historyStatLabel}>Tushum</Text>
        </View>
        <View style={styles.historyDivider} />
        <View style={styles.historyStat}>
          <Text style={[styles.historyStatValue, { color: C.green }]}>{fmt(netRevenue)}</Text>
          <Text style={styles.historyStatLabel}>Sof daromad</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  statBox: {
    width: '47.5%',
    backgroundColor: C.white, borderRadius: 14,
    padding: 14, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  statSub: { fontSize: 11, color: C.secondary },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted, marginRight: 10 },
  detailLabel: { flex: 1, fontSize: 14, color: C.secondary },
  detailValue: { fontSize: 14, fontWeight: '700', color: C.text },
  historyCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    gap: 12,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyDate: { fontSize: 14, fontWeight: '700', color: C.text },
  historyCashier: { fontSize: 12, color: C.secondary, marginTop: 2 },
  historyBadge: { backgroundColor: C.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  historyBadgeText: { fontSize: 11, fontWeight: '700', color: C.secondary },
  historyStats: { flexDirection: 'row' },
  historyStat: { flex: 1, alignItems: 'center', gap: 3 },
  historyDivider: { width: 1, backgroundColor: C.border, marginVertical: 2 },
  historyStatValue: { fontSize: 13, fontWeight: '700', color: C.text },
  historyStatLabel: { fontSize: 11, color: C.muted },
});
