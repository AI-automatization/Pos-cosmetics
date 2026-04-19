import React from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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
import { colors, spacing, borderRadius } from '@/theme';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type FilterType = 'ALL' | 'TREND' | 'DEADSTOCK' | 'MARGIN' | 'FORECAST';
type PeriodType = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER';

const FILTERS: FilterType[] = ['ALL', 'TREND', 'DEADSTOCK', 'MARGIN', 'FORECAST'];

const PERIODS: PeriodType[] = ['TODAY', 'WEEK', 'MONTH', 'QUARTER'];

const FILTER_ICON: Record<FilterType, keyof typeof Ionicons.glyphMap> = {
  ALL:       'grid-outline',
  TREND:     'trending-up-outline',
  DEADSTOCK: 'cube-outline',
  MARGIN:    'cash-outline',
  FORECAST:  'telescope-outline',
};

const FILTER_ACTIVE_COLOR: Record<FilterType, string> = {
  ALL:       colors.primary,
  TREND:     colors.success,
  DEADSTOCK: colors.danger,
  MARGIN:    colors.warning,
  FORECAST:  colors.purple,
};

// ---------------------------------------------------------------------------
// Sub-component: ScreenHeader
// ---------------------------------------------------------------------------

interface ScreenHeaderProps {
  readonly title: string;
  readonly subtitle: string;
}

function ScreenHeader({ title, subtitle }: ScreenHeaderProps): React.JSX.Element {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderTitle}>
        <Text style={styles.screenHeaderText}>{title}</Text>
        <Ionicons name="sparkles" size={20} color="#F59E0B" />
      </View>
      <Text style={styles.screenHeaderSubtitle}>{subtitle}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: PeriodSelector
// ---------------------------------------------------------------------------

interface PeriodSelectorProps {
  readonly period: PeriodType;
  readonly onSelect: (p: PeriodType) => void;
}

const PERIOD_LABEL: Record<PeriodType, string> = {
  TODAY:   'insights.periodToday',
  WEEK:    'insights.periodWeek',
  MONTH:   'insights.periodMonth',
  QUARTER: 'insights.periodQuarter',
};

function PeriodSelector({ period, onSelect }: PeriodSelectorProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.periodRow}
    >
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p}
          style={[styles.periodPill, period === p && styles.periodPillActive]}
          onPress={() => onSelect(p)}
          accessibilityRole="button"
        >
          <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
            {t(PERIOD_LABEL[p])}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: FilterChips
// ---------------------------------------------------------------------------

interface FilterChipsProps {
  readonly filter: FilterType;
  readonly onSelect: (f: FilterType) => void;
}

function FilterChips({ filter, onSelect }: FilterChipsProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {FILTERS.map((f) => {
        const isActive    = filter === f;
        const activeColor = FILTER_ACTIVE_COLOR[f];
        return (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              isActive && { backgroundColor: activeColor },
            ]}
            onPress={() => onSelect(f)}
            accessibilityRole="button"
          >
            <Ionicons
              name={FILTER_ICON[f]}
              size={13}
              color={isActive ? colors.surface : colors.textSecond}
              style={styles.filterIcon}
            />
            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
              {t(`insights.filter${f}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: SummaryRow
// ---------------------------------------------------------------------------

interface SummaryRowProps {
  readonly totalCount: number;
  readonly criticalCount: number;
}

function SummaryRow({ totalCount, criticalCount }: SummaryRowProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryPill}>
        <Text style={styles.summaryText}>
          {t('insights.summaryTotal', { count: totalCount })}
        </Text>
      </View>
      {criticalCount > 0 && (
        <View style={[styles.summaryPill, styles.summaryPillCritical]}>
          <Ionicons name="warning-outline" size={12} color={colors.danger} />
          <Text style={[styles.summaryText, styles.summaryTextCritical]}>
            {t('insights.summaryCritical', { count: criticalCount })}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function AIInsightsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();
  const [filter, setFilter]   = React.useState<FilterType>('ALL');
  const [period, setPeriod]   = React.useState<PeriodType>('WEEK');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['insights', selectedBranchId, period],
    queryFn:  safeQueryFn<InsightItem[]>(
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
      {/* Screen header: title + sparkle icon + subtitle */}
      <ScreenHeader
        title={t('insights.heading')}
        subtitle={t('insights.subtitle')}
      />

      {/* Period pills */}
      <PeriodSelector period={period} onSelect={setPeriod} />

      {/* Filter chips */}
      <FilterChips filter={filter} onSelect={setFilter} />

      {/* Summary row */}
      <SummaryRow totalCount={data?.length ?? 0} criticalCount={criticalCount} />

      {/* Insight list */}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Screen header
  screenHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.sm,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenHeaderTitle: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.xs,
    marginBottom:   4,
  },
  screenHeaderText: {
    fontSize:   24,
    fontWeight: '700',
    color:      colors.textPrimary,
  },
  screenHeaderSubtitle: {
    fontSize: 13,
    color:    colors.textSecond,
  },

  // Period selector
  periodRow: {
    flexDirection:   'row',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.sm,
    gap:               spacing.sm,
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      borderRadius.full,
    backgroundColor:   colors.surfaceLow,
    minHeight:         34,
    justifyContent:    'center',
  },
  periodPillActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize:   13,
    fontWeight: '600',
    color:      colors.textSecond,
  },
  periodTextActive: {
    color: colors.surface,
  },

  // Filter chips
  filterRow: {
    flexDirection:     'row',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.xs,
    gap:               spacing.sm,
  },
  filterChip: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:      borderRadius.full,
    backgroundColor:   colors.surfaceLow,
    minHeight:         34,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontSize:   12,
    fontWeight: '600',
    color:      colors.textSecond,
  },
  filterTextActive: {
    color: colors.surface,
  },

  // Summary row
  summaryRow: {
    flexDirection:     'row',
    gap:               spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.xs,
  },
  summaryPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      borderRadius.full,
    backgroundColor:   colors.surfaceLow,
  },
  summaryPillCritical: {
    backgroundColor: '#FEE2E2',
  },
  summaryText: {
    fontSize:   12,
    fontWeight: '500',
    color:      colors.textSecond,
  },
  summaryTextCritical: {
    color: colors.danger,
  },

  // List
  list: {
    padding:    spacing.lg,
    paddingTop: spacing.md,
    flexGrow:   1,
  },
  separator: {
    height: spacing.sm,
  },
});
