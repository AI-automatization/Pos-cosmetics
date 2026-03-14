import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '../../hooks/useAnalytics';
import ScreenLayout from '../../components/layout/ScreenLayout';
import RevenueByBranchChart from './RevenueByBranchChart';
import OrdersByBranchChart from './OrdersByBranchChart';
import StockValueByBranch from './StockValueByBranch';
import { Period } from '../../hooks/usePeriodFilter';
import { Colors, Radii } from '../../config/theme';

const PERIODS: Period[] = ['today', 'week', 'month', 'year'];

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { period, setPeriod, revenueByBranch, branchComparison, stockValue } = useAnalytics();

  const handleRefresh = async () => {
    await Promise.all([revenueByBranch.refetch(), branchComparison.refetch(), stockValue.refetch()]);
  };

  return (
    <ScreenLayout title={t('analytics.title')}>
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {t(`common.${p}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={revenueByBranch.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
        contentContainerStyle={styles.content}
      >
        <RevenueByBranchChart data={revenueByBranch.data} />
        <OrdersByBranchChart data={revenueByBranch.data} />
        <StockValueByBranch data={stockValue.data} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgSubtle,
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodTextActive: {
    color: Colors.textWhite,
  },
  content: { paddingBottom: 32 },
});
