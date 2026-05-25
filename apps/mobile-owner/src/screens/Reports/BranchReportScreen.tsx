import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, BranchReport } from '../../api/analytics.api';
import { QUERY_KEYS } from '../../config/queryKeys';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../config/theme';
import { styles } from './BranchReportScreen.styles';
import { PERIODS, MOCK_BRANCHES } from './branch-report.utils';
import type { PeriodKey } from './branch-report.utils';
import BranchCard from './BranchCard';

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

