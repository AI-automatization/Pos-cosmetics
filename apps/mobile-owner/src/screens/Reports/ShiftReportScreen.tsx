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
import { formatDateTime, formatDuration } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import { Colors, Radii } from '../../config/theme';

// ─── Period config ─────────────────────────────────────
type PeriodKey = 'today' | '7d' | '30d';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d', label: '7 kun' },
  { key: '30d', label: '30 kun' },
];

function periodDates(key: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  switch (key) {
    case 'today':
      return { from: to, to };
    case '7d': {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      return { from: d.toISOString().split('T')[0]!, to };
    }
    case '30d': {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      return { from: d.toISOString().split('T')[0]!, to };
    }
  }
}

// ─── Mock data ────────────────────────────────────────
const MOCK_SHIFTS: ShiftReport[] = [
  {
    id: 'sr1',
    cashierName: 'Sarvar Qodirov',
    branchName: 'Chilonzor',
    openedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    closedAt: null,
    status: 'open',
    totalRevenue: 8_450_000,
    totalOrders: 34,
    cashRevenue: 3_200_000,
    cardRevenue: 5_250_000,
    openingCash: 500_000,
    expectedCash: 3_700_000,
    closingCash: null,
    discrepancy: null,
  },
  {
    id: 'sr2',
    cashierName: 'Muhabbat Tosheva',
    branchName: 'Chilonzor',
    openedAt: new Date(Date.now() - 28 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 12_780_000,
    totalOrders: 58,
    cashRevenue: 5_200_000,
    cardRevenue: 7_580_000,
    openingCash: 500_000,
    expectedCash: 5_700_000,
    closingCash: 5_700_000,
    discrepancy: 0,
  },
  {
    id: 'sr3',
    cashierName: 'Jahongir Nazarov',
    branchName: 'Yunusabad',
    openedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 9_340_000,
    totalOrders: 42,
    cashRevenue: 3_800_000,
    cardRevenue: 5_540_000,
    openingCash: 500_000,
    expectedCash: 4_300_000,
    closingCash: 4_150_000,
    discrepancy: -150_000,
  },
  {
    id: 'sr4',
    cashierName: 'Zulfiya Ergasheva',
    branchName: "Mirzo Ulug'bek",
    openedAt: new Date(Date.now() - 52 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 44 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 6_890_000,
    totalOrders: 31,
    cashRevenue: 2_900_000,
    cardRevenue: 3_990_000,
    openingCash: 500_000,
    expectedCash: 3_400_000,
    closingCash: 3_480_000,
    discrepancy: 80_000,
  },
];

// ─── Helpers ──────────────────────────────────────────
function discrepancyColor(d: number | null): string {
  if (d === null) return Colors.textMuted;
  if (d === 0) return Colors.success;
  if (d < 0) return Colors.danger;
  return Colors.info;
}

function discrepancyLabel(d: number | null): string {
  if (d === null) return '---';
  if (d === 0) return '0 UZS (OK)';
  const sign = d > 0 ? '+' : '';
  return `${sign}${formatCurrency(d)}`;
}

// ─── ShiftCard ────────────────────────────────────────
const ShiftCard = React.memo(function ShiftCard({ item }: { item: ShiftReport }) {
  const isOpen = item.status === 'open';

  return (
    <View style={styles.card}>
      {/* Header: cashier + status */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cashierName} numberOfLines={1}>{item.cashierName}</Text>
            <Text style={styles.branchName}>{item.branchName}</Text>
          </View>
        </View>
        <Badge
          label={isOpen ? 'OCHIQ' : 'YOPIQ'}
          variant={isOpen ? 'success' : 'neutral'}
        />
      </View>

      {/* Time row */}
      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.timeText}>
            {formatDateTime(item.openedAt)}
            {item.closedAt ? ` — ${formatDateTime(item.closedAt)}` : ''}
          </Text>
        </View>
        {item.closedAt && (
          <Text style={styles.durationText}>
            {formatDuration(item.openedAt, item.closedAt)}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Revenue breakdown */}
      <View style={styles.revenueSection}>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Jami tushum</Text>
          <Text style={styles.revenueTotal}>{formatCurrency(item.totalRevenue)}</Text>
        </View>
        <View style={styles.revenueRow}>
          <View style={styles.revenueDot}>
            <View style={[styles.dot, { backgroundColor: Colors.success }]} />
            <Text style={styles.revenueSub}>Naqd</Text>
          </View>
          <Text style={styles.revenueSubValue}>{formatCurrency(item.cashRevenue)}</Text>
        </View>
        <View style={styles.revenueRow}>
          <View style={styles.revenueDot}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.revenueSub}>Karta</Text>
          </View>
          <Text style={styles.revenueSubValue}>{formatCurrency(item.cardRevenue)}</Text>
        </View>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueSub}>Buyurtmalar</Text>
          <Text style={styles.revenueSubValue}>{item.totalOrders} ta</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Cash reconciliation */}
      <View style={styles.reconciliation}>
        <View style={styles.reconciliationHeader}>
          <Ionicons name="cash-outline" size={16} color={Colors.primary} />
          <Text style={styles.reconciliationTitle}>Kassa solishtirma</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>Boshlang'ich naqd</Text>
          <Text style={styles.reconValue}>{formatCurrency(item.openingCash)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>Kutilgan naqd</Text>
          <Text style={styles.reconValue}>{formatCurrency(item.expectedCash)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>Yopilish naqdi</Text>
          <Text style={styles.reconValue}>
            {item.closingCash !== null ? formatCurrency(item.closingCash) : '---'}
          </Text>
        </View>
        <View style={styles.reconDivider} />
        <View style={styles.reconRow}>
          <Text style={styles.reconLabelBold}>Farq</Text>
          <Text style={[styles.reconValueBold, { color: discrepancyColor(item.discrepancy) }]}>
            {discrepancyLabel(item.discrepancy)}
          </Text>
        </View>
      </View>
    </View>
  );
});

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

  // Card
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardHeaderInfo: { flex: 1 },
  cashierName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  branchName: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  timeText: { fontSize: 12, color: Colors.textMuted },
  durationText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  divider: { height: 1, backgroundColor: Colors.border },

  // Revenue section
  revenueSection: { padding: 14, gap: 6 },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  revenueTotal: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  revenueDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  revenueSub: { fontSize: 13, color: Colors.textMuted },
  revenueSubValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  // Reconciliation
  reconciliation: {
    padding: 14,
    backgroundColor: Colors.bgSubtle,
    gap: 6,
  },
  reconciliationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reconciliationTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  reconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reconLabel: { fontSize: 12, color: Colors.textMuted },
  reconValue: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  reconDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  reconLabelBold: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  reconValueBold: { fontSize: 14, fontWeight: '800' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted },
});
