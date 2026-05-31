import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
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
import BranchCard from './BranchCard';
import BranchSummaryCard from './BranchSummaryCard';
import { C, styles, PERIODS, type PeriodKey } from './BranchReportsScreen.styles';

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
              <BranchSummaryCard
                totalRevenue={totalRevenue}
                branchCount={branchRevenue.length}
              />
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
