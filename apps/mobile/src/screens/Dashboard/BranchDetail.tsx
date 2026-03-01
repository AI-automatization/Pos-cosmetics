import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonCard, SkeletonList } from '@/components/common/SkeletonLoader';
import ErrorView from '@/components/common/ErrorView';
import TrendIndicator from '@/components/charts/TrendIndicator';
import { analyticsApi } from '@/api/analytics.api';
import { alertsApi } from '@/api/alerts.api';
import { inventoryApi } from '@/api/inventory.api';
import { formatCurrency, formatRelativeTime } from '@/utils/format';
import type { Alert } from '@/api/alerts.api';
import type { StockItem } from '@/api/inventory.api';
import { QUERY_STALE_TIMES, REFETCH_INTERVALS } from '@/config/constants';

type Props = NativeStackScreenProps<DashboardStackParamList, 'BranchDetail'>;

function AlertRow({ item }: { item: Alert }): React.JSX.Element {
  const priorityVariant: Record<string, 'error' | 'warning' | 'info'> = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'info',
  };
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle}>{item.title}</Text>
        <Text style={styles.listRowSub}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <Badge label={item.priority} variant={priorityVariant[item.priority] ?? 'info'} />
    </View>
  );
}

function StockRow({ item }: { item: StockItem }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle}>{item.productName}</Text>
        <Text style={styles.listRowSub}>{item.warehouseName}</Text>
      </View>
      <View style={styles.listRowRight}>
        <Text style={[styles.qty, item.isLow && styles.qtyLow]}>{item.quantity}</Text>
        {item.isLow && <Badge label={t('inventory.lowStock')} variant="warning" />}
      </View>
    </View>
  );
}

export default function BranchDetailScreen({ route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { branchId, branchName } = route.params;

  const revenue = useQuery({
    queryKey: ['branch-detail', 'revenue', branchId],
    queryFn: () => analyticsApi.getRevenue(branchId),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const alerts = useQuery({
    queryKey: ['branch-detail', 'alerts', branchId],
    queryFn: () => alertsApi.getActive(branchId),
    staleTime: QUERY_STALE_TIMES.ALERTS,
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  const stock = useQuery({
    queryKey: ['branch-detail', 'stock', branchId],
    queryFn: () => inventoryApi.getStock(branchId),
    staleTime: QUERY_STALE_TIMES.INVENTORY,
  });

  const refetchAll = (): void => {
    void revenue.refetch();
    void alerts.refetch();
    void stock.refetch();
  };

  if (revenue.isLoading) {
    return (
      <ScreenLayout title={branchName}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonList count={3} />
      </ScreenLayout>
    );
  }

  if (revenue.error) {
    return <ErrorView error={revenue.error} onRetry={refetchAll} />;
  }

  const periodLabel: Record<string, string> = {
    daily: t('common.today'),
    weekly: t('common.week'),
    monthly: t('common.month'),
  };

  return (
    <ScreenLayout
      title={branchName}
      onRefresh={refetchAll}
      isRefreshing={revenue.isFetching}
    >
      {/* Revenue */}
      <Text style={styles.sectionTitle}>{t('dashboard.revenue')}</Text>
      {revenue.data?.map((item) => (
        <Card key={item.period}>
          <Text style={styles.revenueLabel}>{periodLabel[item.period] ?? item.period}</Text>
          <Text style={styles.revenueAmount}>{formatCurrency(item.amount, item.currency)}</Text>
          <TrendIndicator value={item.trend} />
        </Card>
      ))}

      {/* Alerts */}
      <Text style={styles.sectionTitle}>{t('dashboard.activeAlerts')}</Text>
      {alerts.isLoading ? (
        <SkeletonList count={2} />
      ) : alerts.data && alerts.data.length > 0 ? (
        <Card>
          <FlatList
            data={alerts.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AlertRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.emptyText}>{t('dashboard.noAlerts')} ✅</Text>
        </Card>
      )}

      {/* Low stock */}
      <Text style={styles.sectionTitle}>{t('inventory.lowStock')}</Text>
      {stock.isLoading ? (
        <SkeletonList count={3} />
      ) : stock.data?.data && stock.data.data.filter((s) => s.isLow).length > 0 ? (
        <Card>
          <FlatList
            data={stock.data.data.filter((s) => s.isLow)}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => <StockRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      ) : (
        <EmptyState message={t('common.noData')} icon="📦" />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  revenueLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  listRowContent: {
    flex: 1,
    marginRight: 8,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  listRowSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  listRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  qty: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  qtyLow: {
    color: '#dc2626',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
