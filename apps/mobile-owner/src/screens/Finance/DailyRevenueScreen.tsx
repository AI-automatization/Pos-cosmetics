import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { reportsApi, DailyRevenuePoint } from '../../api/reports.api';
import { useBranchStore } from '../../store/branch.store';
import { Colors } from '../../config/theme';
import SkeletonList from '../../components/common/SkeletonList';
import { styles } from './DailyRevenueScreen.styles';
import { type PeriodKey, PERIODS, formatAmount, formatDate, getDateRange } from './daily-revenue.utils';
import { DailyRevenueHeader, SummaryCard } from './DailyRevenueHeader';

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

  const summary = useMemo(() => {
    const totalRevenue = items.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = items.reduce((sum, d) => sum + d.orders, 0);
    const daysCount = items.length || 1;
    const avgPerDay = totalRevenue / daysCount;
    return { totalRevenue, totalOrders, avgPerDay };
  }, [items]);

  const highThreshold = useMemo(() => {
    if (items.length === 0) return 0;
    const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
    const idx = Math.floor(sorted.length * 0.25);
    return sorted[idx]?.revenue ?? 0;
  }, [items]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DailyRevenueHeader onBack={() => navigation.goBack()} />
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
      <DailyRevenueHeader onBack={() => navigation.goBack()} />

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
