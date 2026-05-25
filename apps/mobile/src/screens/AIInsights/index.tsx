import React from 'react';
import { FlatList, View } from 'react-native';
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
import {
  type FilterType,
  type PeriodType,
  ScreenHeader,
  PeriodSelector,
  FilterChips,
  SummaryRow,
} from './AIInsightsComponents';
import { styles } from './AIInsightsScreen.styles';

export default function AIInsightsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();
  const [filter, setFilter] = React.useState<FilterType>('ALL');
  const [period, setPeriod] = React.useState<PeriodType>('WEEK');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['insights', selectedBranchId, period],
    queryFn: safeQueryFn<InsightItem[]>(
      () => analyticsApi.getInsights(selectedBranchId ?? undefined),
      [],
    ),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
  });

  const filtered = React.useMemo((): InsightItem[] => {
    if (!data) return [];
    if (filter === 'ALL') return data;
    return data.filter((item) => item.type === filter);
  }, [data, filter]);

  const criticalCount = React.useMemo(
    () => (data ?? []).filter((item) => item.priority === 'HIGH').length,
    [data],
  );

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
      <ScreenHeader
        title={t('insights.heading')}
        subtitle={t('insights.subtitle')}
      />

      <PeriodSelector period={period} onSelect={setPeriod} />

      <FilterChips filter={filter} onSelect={setFilter} />

      <SummaryRow totalCount={data?.length ?? 0} criticalCount={criticalCount} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TrendCard item={item} />}
        ListEmptyComponent={<EmptyState title={t('insights.noInsights')} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}
