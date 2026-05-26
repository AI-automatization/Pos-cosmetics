import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { reportsApi, DailyRevenuePoint } from '../../api/reports.api';
import { useBranchStore } from '../../store/branch.store';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';
import SkeletonList from '../../components/common/SkeletonList';

type PeriodKey = '7d' | '30d' | '90d';

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d', label: '7 kun', days: 7 },
  { key: '30d', label: '30 kun', days: 30 },
  { key: '90d', label: '90 kun', days: 90 },
];

function formatAmount(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B UZS`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M UZS`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K UZS`;
  }
  return `${amount.toLocaleString('uz-UZ')} UZS`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = [
      'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
      'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek',
    ];
    const month = months[d.getMonth()];
    const weekDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const weekDay = weekDays[d.getDay()];
    return `${weekDay}, ${day}-${month}`;
  } catch {
    return dateStr;
  }
}

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export default function DailyRevenueScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const periodConfig = PERIODS.find((p) => p.key === period)!;
  const dateRange = useMemo(() => getDateRange(periodConfig.days), [periodConfig.days]);

  const { data, isLoading, isFetching, refetch } = useQuery<DailyRevenuePoint[]>({
    queryKey: ['daily-revenue', period, selectedBranchId],
    queryFn: () => reportsApi.getDailyRevenue(dateRange.from, dateRange.to),
    retry: false,
  });

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const items = data ?? [];

  // Compute summary
  const summary = useMemo(() => {
    const totalRevenue = items.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = items.reduce((sum, d) => sum + d.orders, 0);
    const daysCount = items.length || 1;
    const avgPerDay = totalRevenue / daysCount;
    return { totalRevenue, totalOrders, avgPerDay };
  }, [items]);

  // Determine "high" threshold for color coding (top 25%)
  const highThreshold = useMemo(() => {
    if (items.length === 0) return 0;
    const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
    const idx = Math.floor(sorted.length * 0.25);
    return sorted[idx]?.revenue ?? 0;
  }, [items]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header onBack={() => navigation.goBack()} />
        <SkeletonList count={6} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: DailyRevenuePoint }) => {
    const isHigh = item.revenue >= highThreshold && highThreshold > 0;
    return (
      <View style={[styles.dayCard, isHigh && styles.dayCardHigh]}>
        <View style={styles.dayLeft}>
          <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
          <View style={styles.dayMeta}>
            <Ionicons name="cart-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.dayMetaText}>{item.orders} buyurtma</Text>
            {item.discounts > 0 && (
              <>
                <Ionicons name="pricetag-outline" size={12} color={Colors.warning} />
                <Text style={[styles.dayMetaText, { color: Colors.warning }]}>
                  -{formatAmount(item.discounts)}
                </Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.dayRight}>
          <Text style={[styles.dayRevenue, isHigh && styles.dayRevenueHigh]}>
            {formatAmount(item.revenue)}
          </Text>
          {isHigh && (
            <Ionicons name="arrow-up-circle" size={14} color={Colors.success} />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header onBack={() => navigation.goBack()} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Period Selector */}
            <View style={styles.periodRow}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
                  onPress={() => setPeriod(p.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <SummaryCard
                label="Jami daromad"
                value={formatAmount(summary.totalRevenue)}
                icon="cash-outline"
                color={Colors.primary}
                bgColor={Colors.primaryLight}
              />
              <SummaryCard
                label="Buyurtmalar"
                value={`${summary.totalOrders} ta`}
                icon="cart-outline"
                color={Colors.success}
                bgColor={Colors.successLight}
              />
              <SummaryCard
                label="O'rtacha/kun"
                value={formatAmount(summary.avgPerDay)}
                icon="stats-chart-outline"
                color={Colors.info}
                bgColor={Colors.infoLight}
              />
            </View>

            {/* Section title */}
            <Text style={styles.sectionTitle}>Kunlik tafsilot</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Ma'lumot topilmadi</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
      />
    </SafeAreaView>
  );
}

/* ---------- Sub-components ---------- */

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Kunlik daromad</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bgColor: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.primary,
    flex: 1,
  },
  headerSpacer: { width: 34 },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* Period selector */
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.textWhite,
  },

  /* Summary cards */
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    ...Shadows.card,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  /* Section title */
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  /* Day cards */
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 14,
    ...Shadows.card,
  },
  dayCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  dayLeft: {
    flex: 1,
    gap: 4,
  },
  dayDate: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayRevenue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dayRevenueHigh: {
    color: Colors.success,
  },
  separator: { height: 8 },

  /* Empty */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
