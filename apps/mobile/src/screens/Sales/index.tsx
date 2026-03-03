import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import EmptyState from '../../components/common/EmptyState';
import ScreenLayout from '../../components/common/ScreenLayout';
import SaleItem from './SaleItem';
import { useSalesData } from './useSalesData';
import type { Order } from '@raos/types';

export default function SalesScreen() {
  const { t } = useTranslation();
  const { orders } = useSalesData();

  if (orders.isLoading) return <LoadingSpinner />;
  if (orders.error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView error={orders.error} onRetry={orders.refetch} />
      </SafeAreaView>
    );
  }

  const data = orders.data?.data ?? [];

  return (
    <ScreenLayout
      title={`${t('sales.title')} — ${t('common.today')}`}
      onRefresh={orders.refetch}
      isRefreshing={orders.isFetching}
      scrollable={false}
    >
      <FlatList<Order>
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SaleItem order={item} />}
        ListEmptyComponent={
          <EmptyState icon="🛍️" message={t('common.noData')} />
        }
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
