import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import DebtSummaryCards from './DebtSummaryCards';
import AgingReportChart from './AgingReportChart';
import CustomerDebtList from './CustomerDebtList';
import QuickPaySheet from './QuickPaySheet';
import { useDebts } from '../../hooks/useDebts';
import { CustomerDebt } from '../../api/debts.api';

export default function DebtsScreen() {
  const { t } = useTranslation();
  const { summary, agingReport, customers } = useDebts();

  const [selectedDebt, setSelectedDebt] = useState<CustomerDebt | null>(null);
  const [paySheetVisible, setPaySheetVisible] = useState(false);

  const isLoading = summary.isLoading;

  const summaryData = summary.data;
  const customersData = customers.data?.items ?? [];

  const handleRefresh = async () => {
    await Promise.all([summary.refetch(), agingReport.refetch(), customers.refetch()]);
  };

  const handlePay = useCallback((item: CustomerDebt) => {
    setSelectedDebt(item);
    setPaySheetVisible(true);
  }, []);

  const handlePayClose = useCallback(() => {
    setPaySheetVisible(false);
    setSelectedDebt(null);
  }, []);

  const handlePaySuccess = useCallback(() => {
    void handleRefresh();
  }, []);

  if (isLoading) {
    return (
      <ScreenLayout title={t('debts.title')}>
        <SkeletonList count={3} />
      </ScreenLayout>
    );
  }

  if (summary.isError) {
    return (
      <ScreenLayout title={t('debts.title')}>
        <ErrorView
          error={summary.error}
          onRetry={() => { void handleRefresh(); }}
        />
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
        {summaryData && <DebtSummaryCards data={summaryData} />}
        <AgingReportChart data={agingReport.data} />
        <CustomerDebtList
          data={customersData}
          isRefreshing={customers.isFetching}
          onRefresh={() => { void customers.refetch(); }}
          onPay={handlePay}
        />
      </ScrollView>

      <QuickPaySheet
        visible={paySheetVisible}
        customer={selectedDebt}
        onClose={handlePayClose}
        onSuccess={handlePaySuccess}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
});
