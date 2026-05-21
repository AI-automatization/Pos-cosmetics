import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyticsApi } from '../../api/analytics.api';
import type { BranchRevenueItem, BranchComparisonItem } from '../../api/analytics.api';
import type { FinanceStackParamList } from '../../navigation/types';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  teal:    '#0D9488',
};

// ─── Period config ─────────────────────────────────────
type PeriodKey = 'week' | 'month' | 'year';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy'    },
  { key: 'year',  label: 'Yil'   },
];

// ─── Helpers ───────────────────────────────────────────
function fmtUzs(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

// ─── TrendBadge ────────────────────────────────────────
interface TrendBadgeProps {
  readonly trend: number;
}

function TrendBadge({ trend }: TrendBadgeProps) {
  const isPositive = trend >= 0;
  const label = isPositive
    ? `\u25b2 ${trend.toFixed(1)}%`
    : `\u25bc ${Math.abs(trend).toFixed(1)}%`;
  return (
    <View style={[styles.trendBadge, isPositive ? styles.trendBadgeGreen : styles.trendBadgeRed]}>
      <Text style={[styles.trendText, isPositive ? styles.trendTextGreen : styles.trendTextRed]}>
        {label}
      </Text>
    </View>
  );
}

// ─── BranchCard ────────────────────────────────────────
interface BranchCardProps {
  readonly item: BranchRevenueItem;
  readonly trend: number | undefined;
}

const BranchCard = React.memo(function BranchCard({ item, trend }: BranchCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="business-outline" size={18} color={C.teal} />
        </View>
        <Text style={styles.branchName} numberOfLines={1}>{item.branchName}</Text>
        {trend !== undefined && <TrendBadge trend={trend} />}
      </View>

      <Text style={styles.revenueValue}>{fmtUzs(item.revenue)}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="receipt-outline" size={14} color={C.muted} />
          <Text style={styles.footerText}>{item.orders} ta buyurtma</Text>
        </View>
        <Text style={styles.stockValue}>Ombor: {fmtUzs(item.stockValue)}</Text>
      </View>
    </View>
  );
});

// ─── BranchReportsScreen ───────────────────────────────
export default function BranchReportsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<FinanceStackParamList, 'BranchReports'>>();

  const [period, setPeriod] = useState<PeriodKey>('month');

  const {
    data: branchRevenue = [],
    isLoading: isLoadingRevenue,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ['analytics', 'branch-revenue', period],
    queryFn: async () => {
      try {
        return await analyticsApi.getRevenueByBranch(period);
      } catch {
        return [] as BranchRevenueItem[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const {
    data: branchComparison = [],
    isLoading: isLoadingComparison,
    refetch: refetchComparison,
  } = useQuery({
    queryKey: ['analytics', 'branch-comparison'],
    queryFn: async () => {
      try {
        return await analyticsApi.getBranchComparison();
      } catch {
        return [] as BranchComparisonItem[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const isLoading = isLoadingRevenue || isLoadingComparison;

  const handleRefresh = useCallback(() => {
    void refetchRevenue();
    void refetchComparison();
  }, [refetchRevenue, refetchComparison]);

  const trendMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    // BranchComparisonItem does not include trend data;
    // revenue-by-branch items will render without a trend badge.
    return map;
  }, [branchComparison]);

  const totalRevenue = useMemo(
    () => branchRevenue.reduce((sum, b) => sum + b.revenue, 0),
    [branchRevenue],
  );

  const renderBranchCard = useCallback(
    ({ item }: { item: BranchRevenueItem }) => (
      <BranchCard item={item} trend={trendMap[item.branchId]} />
    ),
    [trendMap],
  );

  const keyExtractor = useCallback((item: BranchRevenueItem) => item.branchId, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filial hisobotlari</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Period filter */}
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
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={branchRevenue}
          keyExtractor={keyExtractor}
          renderItem={renderBranchCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={C.primary}
            />
          }
          ListHeaderComponent={
            branchRevenue.length > 0 ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Jami tushum (barcha filiallar)</Text>
                <Text style={styles.summaryValue}>{fmtUzs(totalRevenue)}</Text>
                <Text style={styles.summaryMeta}>{branchRevenue.length} ta filial</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={44} color={C.muted} />
              <Text style={styles.emptyText}>Bu davr uchun ma'lumot yo'q</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  headerSpacer: { width: 36 },

  pillsBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  loader: { marginTop: 40 },

  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },

  // Summary card
  summaryCard: {
    backgroundColor: C.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: C.white, marginTop: 4 },
  summaryMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  // Branch card
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchName: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },

  revenueValue: { fontSize: 20, fontWeight: '800', color: C.text },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  stockValue: { fontSize: 12, color: C.muted, fontWeight: '500' },

  // Trend badge
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  trendBadgeGreen: { backgroundColor: '#F0FDF4' },
  trendBadgeRed: { backgroundColor: '#FEF2F2' },
  trendText: { fontSize: 12, fontWeight: '700' },
  trendTextGreen: { color: C.green },
  trendTextRed: { color: C.red },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
