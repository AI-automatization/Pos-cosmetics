import React from 'react';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/common/ScreenLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import { useDashboardData } from './useDashboardData';
import RevenueCard from './RevenueCard';
import ActiveShiftCard from './ActiveShiftCard';
import AlertsList from './AlertsList';
import TopProductsCard from './TopProductsCard';
import WeeklyTrendChart from './WeeklyTrendChart';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const {
    todaySummary,
    weeklyRevenue,
    topProducts,
    currentShift,
    lowStock,
    nasiyaSummary,
    isLoading,
    isRefreshing,
    refetchAll,
  } = useDashboardData();

  if (isLoading) return <LoadingSpinner />;

  if (todaySummary.error) {
    return <ErrorView error={todaySummary.error} onRetry={refetchAll} />;
  }

  return (
    <ScreenLayout
      title={t('dashboard.title')}
      onRefresh={refetchAll}
      isRefreshing={isRefreshing}
    >
      {todaySummary.data && <RevenueCard summary={todaySummary.data} />}

      <WeeklyTrendChart data={weeklyRevenue.data ?? []} />

      <ActiveShiftCard shift={currentShift.data ?? null} />

      <AlertsList
        lowStock={lowStock.data ?? []}
        nasiya={nasiyaSummary.data}
      />

      {topProducts.data && topProducts.data.length > 0 && (
        <TopProductsCard products={topProducts.data} />
      )}
    </ScreenLayout>
  );
}
