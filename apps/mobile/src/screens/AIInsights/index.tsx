import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonList } from '@/components/common/SkeletonLoader';
import TrendCard from './TrendCard';
import { analyticsApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { useAppStore } from '@/store/app.store';
import { QUERY_STALE_TIMES } from '@/config/constants';
import type { InsightItem } from '@/api/analytics.api';

type FilterType = 'ALL' | 'TREND' | 'DEADSTOCK' | 'MARGIN' | 'FORECAST';

const FILTERS: FilterType[] = ['ALL', 'TREND', 'DEADSTOCK', 'MARGIN', 'FORECAST'];

export default function AIInsightsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();
  const [filter, setFilter] = React.useState<FilterType>('ALL');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['insights', selectedBranchId],
    queryFn: safeQueryFn<InsightItem[]>(() => analyticsApi.getInsights(selectedBranchId ?? undefined), []),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
  });

  const filtered = React.useMemo((): InsightItem[] => {
    if (!data) return [];
    if (filter === 'ALL') return data;
    return data.filter((item) => item.type === filter);
  }, [data, filter]);

  if (isLoading) {
    return (
      <ScreenLayout title={t('insights.title')}>
        <SkeletonList count={4} />
      </ScreenLayout>
    );
  }

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      title={t('insights.title')}
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {t(`insights.filter${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TrendCard item={item} />}
        ListEmptyComponent={<EmptyState message={t('insights.noInsights')} icon="🤖" />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    minHeight: 32,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#1a56db',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
});
