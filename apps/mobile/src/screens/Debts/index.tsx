import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import DebtSummaryCards from './DebtSummaryCards';
import AgingReportChart from './AgingReportChart';
import CustomerDebtList from './CustomerDebtList';
import { useDebts } from '../../hooks/useDebts';

export default function DebtsScreen() {
  const { t } = useTranslation();
  const { summary, agingReport, customers } = useDebts();

  const handleRefresh = async () => {
    await Promise.all([summary.refetch(), agingReport.refetch(), customers.refetch()]);
  };

  const handleRetry = () => {
    void handleRefresh();
  };

  if (summary.isLoading) {
    return (
      <ScreenLayout title={t('debts.title')}>
        <SkeletonList count={3} />
      </ScreenLayout>
    );
  }

  if (summary.isError) {
    return (
      <ScreenLayout title={t('debts.title')}>
        <ErrorView error={summary.error} onRetry={handleRetry} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('debts.title')}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={summary.isFetching} onRefresh={() => { void handleRefresh(); }} />
        }
        contentContainerStyle={styles.content}
      >
        {summary.data && <DebtSummaryCards data={summary.data} />}
        <AgingReportChart data={agingReport.data} />
        <CustomerDebtList
          data={customers.data?.items ?? []}
          isRefreshing={customers.isFetching}
          onRefresh={() => { void customers.refetch(); }}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
});
