import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import DebtSummaryCards from './DebtSummaryCards';
import AgingReportChart from './AgingReportChart';
import CustomerDebtList from './CustomerDebtList';
import { useDebts } from '../../hooks/useDebts';
import { DebtSummary, CustomerDebt } from '../../api/debts.api';

const MOCK_SUMMARY: DebtSummary = {
  totalDebt: 16_100_000,
  overdueDebt: 7_600_000,
  overdueCount: 13,
  debtorCount: 25,
  avgDebt: 644_000,
};

const MOCK_CUSTOMERS: CustomerDebt[] = [
  { customerId: 'c1', customerName: 'Nodira Yusupova', phone: '+998 90 123 45 67', branchName: 'Chilonzor', totalDebt: 2_400_000, overdueAmount: 2_400_000, daysSinceLastPayment: 65, agingBucket: '61_90', lastPurchaseDate: '2026-01-06' },
  { customerId: 'c2', customerName: 'Jasur Toshmatov', phone: '+998 91 234 56 78', branchName: 'Yunusabad', totalDebt: 1_850_000, overdueAmount: 1_850_000, daysSinceLastPayment: 45, agingBucket: '31_60', lastPurchaseDate: '2026-01-26' },
  { customerId: 'c3', customerName: 'Malika Rahimova', phone: '+998 93 345 67 89', branchName: 'Chilonzor', totalDebt: 980_000, overdueAmount: 0, daysSinceLastPayment: 12, agingBucket: '0_30', lastPurchaseDate: '2026-02-28' },
  { customerId: 'c4', customerName: 'Sherzod Azimov', phone: '+998 99 456 78 90', branchName: "Mirzo Ulug'bek", totalDebt: 3_200_000, overdueAmount: 3_200_000, daysSinceLastPayment: 98, agingBucket: '90_plus', lastPurchaseDate: '2025-12-03' },
  { customerId: 'c5', customerName: 'Dilnoza Xasanova', phone: '+998 94 567 89 01', branchName: 'Sergeli', totalDebt: 560_000, overdueAmount: 0, daysSinceLastPayment: 8, agingBucket: '0_30', lastPurchaseDate: '2026-03-03' },
  { customerId: 'c6', customerName: 'Bobur Mirzayev', phone: '+998 97 678 90 12', branchName: 'Yunusabad', totalDebt: 1_200_000, overdueAmount: 1_200_000, daysSinceLastPayment: 52, agingBucket: '31_60', lastPurchaseDate: '2026-01-19' },
];

export default function DebtsScreen() {
  const { t } = useTranslation();
  const { summary, agingReport, customers } = useDebts();

  const isLoading = summary.isLoading;

  // Use real data if available, fall back to mock
  const summaryData = summary.data ?? MOCK_SUMMARY;
  const customersData = customers.data?.items ?? MOCK_CUSTOMERS;

  const handleRefresh = async () => {
    await Promise.all([summary.refetch(), agingReport.refetch(), customers.refetch()]);
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('debts.title')}>
        <SkeletonList count={3} />
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
        <DebtSummaryCards data={summaryData} />
        <AgingReportChart data={agingReport.data} />
        <CustomerDebtList
          data={customersData}
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
