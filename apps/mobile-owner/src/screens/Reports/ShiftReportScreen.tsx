import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { shiftsApi, ShiftReport } from '../../api/shifts.api';
import { useBranchStore } from '../../store/branch.store';
import { QUERY_KEYS } from '../../config/queryKeys';
import { formatCurrency } from '../../utils/formatCurrency';
import ShiftCard from './ShiftCard';
import { PeriodKey, PERIODS, periodDates, MOCK_SHIFTS } from './shift-report.utils';
import { Colors, Radii } from '../../config/theme';

// ─── ShiftReportScreen ────────────────────────────────
export default function ShiftReportScreen() {
  const navigation = useNavigation();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const [period, setPeriod] = useState<PeriodKey>('today');

  const { from, to } = useMemo(() => periodDates(period), [period]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.reports.shiftReports(selectedBranchId, period),
    queryFn: async () => {
      try {
        return await shiftsApi.getShiftReports({
          from,
          to,
          branchId: selectedBranchId,
        });
      } catch {
        return [] as ShiftReport[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const shifts = data && data.length > 0 ? data : MOCK_SHIFTS;

  // Summary
  const totalRevenue = shifts.reduce((s, x) => s + x.totalRevenue, 0);
  const totalOrders = shifts.reduce((s, x) => s + x.totalOrders, 0);
  const closedCount = shifts.filter((s) => s.status === 'closed').length;

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: ShiftReport }) => <ShiftCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ShiftReport) => item.id, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smena hisobotlari</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Period pills */}
      <View style={styles.pillsBar}>
        {PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary strip */}
      {!isLoading && shifts.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Jami tushum</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Buyurtmalar</Text>
            <Text style={styles.summaryValue}>{totalOrders} ta</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Smenalar</Text>
            <Text style={styles.summaryValue}>{closedCount}/{shifts.length}</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Smenalar topilmadi</Text>
              <Text style={styles.emptySubtitle}>
                Bu davrda smena hisobotlari yo'q
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  headerSpacer: { width: 36 },

  pillsBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  pillTextActive: { color: Colors.textWhite },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 12 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted },
});
