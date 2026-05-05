import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { shiftsApi } from '../../api/shifts.api';
import { todayISO } from '../../utils/date';
import { formatCompact } from '../../utils/currency';

const C = {
  bg:      '#FFFFFF',
  text:    '#111827',
  muted:   '#6B7280',
  border:  '#E5E7EB',
  primary: '#2563EB',
  teal:    '#0D9488',
} as const;

const FALLBACK = { totalRevenue: 0, totalOrders: 0, totalShifts: 0, avgRevenuePerShift: 0 };

function ManagerKPICard(): React.ReactElement {
  const today = todayISO();

  const { data, isLoading } = useQuery({
    queryKey: ['shifts', 'summary', 'today'],
    queryFn: () => shiftsApi.getShiftSummary({ fromDate: today, toDate: today }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const summary = data ?? FALLBACK;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="bar-chart-outline" size={18} color={C.teal} />
        <Text style={styles.title}>Bugungi smena statistikasi</Text>
        {isLoading && <ActivityIndicator size="small" color={C.teal} style={styles.loader} />}
      </View>

      <View style={styles.dividerH} />

      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Smenalar</Text>
          <Text style={styles.cellValue}>{summary.totalShifts}</Text>
        </View>

        <View style={styles.dividerV} />

        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Buyurtmalar</Text>
          <Text style={styles.cellValue}>{summary.totalOrders}</Text>
        </View>
      </View>

      <View style={styles.dividerH} />

      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Daromad</Text>
          <Text style={styles.cellValue}>{formatCompact(summary.totalRevenue)}</Text>
          <Text style={styles.cellSub}>so'm</Text>
        </View>

        <View style={styles.dividerV} />

        <View style={styles.cell}>
          <Text style={styles.cellLabel}>O'rt. smena</Text>
          <Text style={styles.cellValue}>{formatCompact(summary.avgRevenuePerShift)}</Text>
          <Text style={styles.cellSub}>so'm</Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(ManagerKPICard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  loader: {
    marginLeft: 4,
  },
  dividerH: {
    height: 1,
    backgroundColor: C.border,
  },
  grid: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  dividerV: {
    width: 1,
    backgroundColor: C.border,
  },
  cellLabel: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  cellSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
});
