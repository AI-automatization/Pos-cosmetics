import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import ErrorView from '@/components/common/ErrorView';
import { SkeletonCard, SkeletonList } from '@/components/common/SkeletonLoader';
import TrendIndicator from '@/components/charts/TrendIndicator';
import Badge from '@/components/common/Badge';
import { useDashboard } from '@/hooks/useDashboard';
import { useAppStore } from '@/store/app.store';
import { formatCurrency, formatRelativeTime } from '@/utils/format';
import type { Alert } from '@/api/alerts.api';
import type { RevenueData, BranchRevenue } from '@/api/analytics.api';
import type { ActiveShift, TopProduct } from '@/api/sales.api';

type Props = {
  navigation: NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;
};

function RevenueCard({ item }: { item: RevenueData }): React.JSX.Element {
  const { t } = useTranslation();
  const periodLabel: Record<string, string> = {
    daily: t('common.today'),
    weekly: t('common.week'),
    monthly: t('common.month'),
  };
  return (
    <Card>
      <Text style={styles.revenueLabel}>{periodLabel[item.period] ?? item.period}</Text>
      <Text style={styles.revenueAmount}>{formatCurrency(item.amount, item.currency)}</Text>
      <TrendIndicator value={item.trend} />
    </Card>
  );
}

function BranchComparisonRow({
  item,
  maxRevenue,
  onPress,
}: {
  item: BranchRevenue;
  maxRevenue: number;
  onPress: () => void;
}): React.JSX.Element {
  const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
  return (
    <TouchableOpacity style={styles.branchRow} onPress={onPress} accessibilityRole="button">
      <View style={styles.branchRowTop}>
        <Text style={styles.branchName}>{item.branchName}</Text>
        <View style={styles.branchRowRight}>
          <TrendIndicator value={item.trend} />
          <Text style={styles.branchRevenue}>{formatCurrency(item.revenue)}</Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barWidth}%` as `${number}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

function AlertRow({ item }: { item: Alert }): React.JSX.Element {
  const priorityVariant: Record<string, 'error' | 'warning' | 'info'> = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'info',
  };
  return (
    <View style={styles.alertRow}>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <Badge label={item.priority} variant={priorityVariant[item.priority] ?? 'info'} />
    </View>
  );
}

function ShiftRow({ item }: { item: ActiveShift }): React.JSX.Element {
  return (
    <View style={styles.shiftRow}>
      <View style={styles.shiftDot} />
      <View style={styles.shiftContent}>
        <Text style={styles.shiftCashier}>{item.cashierName}</Text>
        <Text style={styles.shiftBranch}>{item.branchName}</Text>
      </View>
      <Text style={styles.shiftTime}>{formatRelativeTime(item.openedAt)}</Text>
    </View>
  );
}

function TopProductRow({ item, index }: { item: TopProduct; index: number }): React.JSX.Element {
  return (
    <View style={styles.topProductRow}>
      <Text style={styles.topProductRank}>#{index + 1}</Text>
      <Text style={styles.topProductName} numberOfLines={1}>{item.productName}</Text>
      <Text style={styles.topProductQty}>{item.quantity} dona</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();
  const { revenue, alerts, branchComparison, quickStats, activeShifts } = useDashboard(
    selectedBranchId ?? undefined,
  );

  const refetchAll = (): void => {
    void revenue.refetch();
    void alerts.refetch();
    void branchComparison.refetch();
    void quickStats.refetch();
    void activeShifts.refetch();
  };

  if (revenue.isLoading) {
    return (
      <ScreenLayout title={t('dashboard.title')}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonList count={3} />
      </ScreenLayout>
    );
  }

  if (revenue.error) return <ErrorView error={revenue.error} onRetry={refetchAll} />;

  const maxRevenue = Math.max(...(branchComparison.data?.map((b) => b.revenue) ?? [1]));

  return (
    <ScreenLayout
      title={t('dashboard.title')}
      onRefresh={refetchAll}
      isRefreshing={revenue.isFetching}
    >
      {/* Revenue Cards */}
      {revenue.data?.map((item) => (
        <RevenueCard key={item.period} item={item} />
      ))}

      {/* Quick Stats */}
      {quickStats.data && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.quickStats')}</Text>
          <Card>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{quickStats.data.ordersCount}</Text>
                <Text style={styles.statLabel}>{t('dashboard.ordersCount')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(quickStats.data.avgBasket, quickStats.data.currency)}
                </Text>
                <Text style={styles.statLabel}>{t('dashboard.avgBasket')}</Text>
              </View>
            </View>
            {quickStats.data.topProducts.length > 0 && (
              <>
                <View style={styles.separator} />
                <Text style={styles.subSectionTitle}>{t('dashboard.topProducts')}</Text>
                {quickStats.data.topProducts.slice(0, 3).map((p, i) => (
                  <TopProductRow key={p.productId} item={p} index={i} />
                ))}
              </>
            )}
          </Card>
        </>
      )}

      {/* Branch Comparison */}
      {branchComparison.isLoading ? (
        <SkeletonList count={3} />
      ) : branchComparison.data && branchComparison.data.length > 1 ? (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.branches')}</Text>
          <Card>
            <FlatList
              data={branchComparison.data}
              keyExtractor={(item) => item.branchId}
              renderItem={({ item }) => (
                <BranchComparisonRow
                  item={item}
                  maxRevenue={maxRevenue}
                  onPress={() =>
                    navigation.navigate('BranchDetail', {
                      branchId: item.branchId,
                      branchName: item.branchName,
                    })
                  }
                />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>
        </>
      ) : null}

      {/* Active Shifts */}
      <Text style={styles.sectionTitle}>{t('dashboard.activeShifts')}</Text>
      {activeShifts.data && activeShifts.data.length > 0 ? (
        <Card>
          <FlatList
            data={activeShifts.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ShiftRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.emptyText}>{t('dashboard.noActiveShifts')}</Text>
        </Card>
      )}

      {/* Alerts */}
      <Text style={styles.sectionTitle}>{t('dashboard.activeAlerts')}</Text>
      {alerts.data && alerts.data.length > 0 ? (
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
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  topProductRank: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a56db',
    width: 28,
  },
  topProductName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  topProductQty: {
    fontSize: 13,
    color: '#6b7280',
  },
  branchRow: {
    paddingVertical: 8,
  },
  branchRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  branchRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  branchRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a56db',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: '#1a56db',
    borderRadius: 3,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  shiftDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 10,
  },
  shiftContent: {
    flex: 1,
  },
  shiftCashier: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  shiftBranch: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  shiftTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  alertContent: {
    flex: 1,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  alertTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
