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
import { analyticsApi, BranchReport } from '../../api/analytics.api';
import { QUERY_KEYS } from '../../config/queryKeys';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors, Radii } from '../../config/theme';

// ─── Period config ─────────────────────────────────────
type PeriodKey = 'today' | 'week' | 'month' | 'year';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: 'week', label: 'Hafta' },
  { key: 'month', label: 'Oy' },
  { key: 'year', label: 'Yil' },
];

// ─── Mock data ────────────────────────────────────────
const MOCK_BRANCHES: BranchReport[] = [
  {
    branchId: 'b1',
    branchName: 'Chilonzor',
    revenue: 48_720_000,
    orders: 247,
    avgOrderValue: 197_247,
    growth: 12.4,
  },
  {
    branchId: 'b2',
    branchName: 'Yunusabad',
    revenue: 35_600_000,
    orders: 189,
    avgOrderValue: 188_360,
    growth: 8.1,
  },
  {
    branchId: 'b3',
    branchName: "Mirzo Ulug'bek",
    revenue: 28_450_000,
    orders: 156,
    avgOrderValue: 182_372,
    growth: -3.2,
  },
  {
    branchId: 'b4',
    branchName: 'Sergeli',
    revenue: 18_900_000,
    orders: 104,
    avgOrderValue: 181_731,
    growth: 5.6,
  },
];

// ─── Rank badge colors ────────────────────────────────
const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEF3C7', text: '#D97706' },
  2: { bg: '#E5E7EB', text: '#6B7280' },
  3: { bg: '#FFEDD5', text: '#EA580C' },
};

const DEFAULT_RANK = { bg: Colors.bgSubtle, text: Colors.textMuted };

// ─── BranchCard ──────────────────────────────────────
const BranchCard = React.memo(function BranchCard({
  item,
  rank,
  maxRevenue,
  totalRevenue,
}: {
  item: BranchReport;
  rank: number;
  maxRevenue: number;
  totalRevenue: number;
}) {
  const rankColors = RANK_COLORS[rank] ?? DEFAULT_RANK;
  const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
  const revenueShare = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
  const isPositive = item.growth >= 0;

  return (
    <View style={styles.card}>
      {/* Header: rank + name + growth */}
      <View style={styles.cardHeader}>
        <View style={[styles.rankBadge, { backgroundColor: rankColors.bg }]}>
          <Text style={[styles.rankText, { color: rankColors.text }]}>#{rank}</Text>
        </View>
        <Text style={styles.branchName} numberOfLines={1}>{item.branchName}</Text>
        <View style={[styles.growthBadge, isPositive ? styles.growthPos : styles.growthNeg]}>
          <Text style={[styles.growthText, isPositive ? styles.growthTextPos : styles.growthTextNeg]}>
            {isPositive ? '\u25B2' : '\u25BC'} {Math.abs(item.growth).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Revenue with bar */}
      <View style={styles.revenueSection}>
        <Text style={styles.revenueValue}>{formatCurrency(item.revenue)}</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${barWidth}%` }]} />
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Buyurtmalar</Text>
          <Text style={styles.statValue}>{item.orders} ta</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>O'rtacha</Text>
          <Text style={styles.statValue}>{formatCurrency(item.avgOrderValue)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Ulush</Text>
          <Text style={styles.statValue}>{revenueShare.toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
});

// ─── BranchReportScreen ──────────────────────────────
export default function BranchReportScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('month');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.reports.branchReport(period),
    queryFn: async () => {
      try {
        return await analyticsApi.getBranchReport(period);
      } catch {
        return [] as BranchReport[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const branches = data && data.length > 0 ? data : MOCK_BRANCHES;

  // Sort by revenue descending
  const sorted = useMemo(
    () => [...branches].sort((a, b) => b.revenue - a.revenue),
    [branches],
  );

  // Summary
  const totalRevenue = useMemo(() => sorted.reduce((s, b) => s + b.revenue, 0), [sorted]);
  const totalOrders = useMemo(() => sorted.reduce((s, b) => s + b.orders, 0), [sorted]);
  const avgGrowth = useMemo(() => {
    if (sorted.length === 0) return 0;
    return sorted.reduce((s, b) => s + b.growth, 0) / sorted.length;
  }, [sorted]);
  const maxRevenue = sorted.length > 0 ? sorted[0]!.revenue : 0;

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: BranchReport; index: number }) => (
      <BranchCard
        item={item}
        rank={index + 1}
        maxRevenue={maxRevenue}
        totalRevenue={totalRevenue}
      />
    ),
    [maxRevenue, totalRevenue],
  );

  const keyExtractor = useCallback((item: BranchReport) => item.branchId, []);

  const isPositiveGrowth = avgGrowth >= 0;

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
        <Text style={styles.headerTitle}>Filial taqqoslash</Text>
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

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={sorted}
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
          ListHeaderComponent={
            sorted.length > 0 ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryMain}>
                    <Text style={styles.summaryLabel}>Jami tushum</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
                  </View>
                  <View style={[styles.summaryGrowth, isPositiveGrowth ? styles.growthPos : styles.growthNeg]}>
                    <Text style={[styles.growthText, isPositiveGrowth ? styles.growthTextPos : styles.growthTextNeg]}>
                      {isPositiveGrowth ? '\u25B2' : '\u25BC'} {Math.abs(avgGrowth).toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryBottom}>
                  <View style={styles.summaryMiniItem}>
                    <Text style={styles.summaryMiniLabel}>Buyurtmalar</Text>
                    <Text style={styles.summaryMiniValue}>{totalOrders} ta</Text>
                  </View>
                  <View style={styles.summaryMiniDivider} />
                  <View style={styles.summaryMiniItem}>
                    <Text style={styles.summaryMiniLabel}>Filiallar</Text>
                    <Text style={styles.summaryMiniValue}>{sorted.length} ta</Text>
                  </View>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Ma'lumot topilmadi</Text>
              <Text style={styles.emptySubtitle}>
                Bu davr uchun filial hisoboti yo'q
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

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },

  // Summary card
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: 18,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryMain: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.textWhite, marginTop: 4 },
  summaryGrowth: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.xl,
  },
  summaryBottom: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryMiniItem: { flex: 1, alignItems: 'center' },
  summaryMiniLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  summaryMiniValue: { fontSize: 15, fontWeight: '800', color: Colors.textWhite, marginTop: 2 },
  summaryMiniDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },

  // Branch card
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
    padding: 14,
    gap: 10,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '800' },
  branchName: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  growthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xl,
  },
  growthPos: { backgroundColor: Colors.successLight },
  growthNeg: { backgroundColor: Colors.dangerLight },
  growthText: { fontSize: 12, fontWeight: '700' },
  growthTextPos: { color: Colors.success },
  growthTextNeg: { color: Colors.danger },

  // Revenue bar
  revenueSection: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  revenueValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  barBg: {
    height: 6,
    backgroundColor: Colors.bgSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSubtle,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted },
});
