import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import EmptyState from '../../components/common/EmptyState';
import ScreenLayout from '../../components/common/ScreenLayout';
import LowStockItem from './LowStockItem';
import { useInventoryData } from './useInventoryData';
import type { LowStockItem as LowStockItemType } from '../../api/inventory.api';

export default function InventoryScreen() {
  const { t } = useTranslation();
  const { lowStock } = useInventoryData();

  if (lowStock.isLoading) return <LoadingSpinner />;
  if (lowStock.error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView error={lowStock.error} onRetry={lowStock.refetch} />
      </SafeAreaView>
    );
  }

  const data = lowStock.data ?? [];

  return (
    <ScreenLayout
      title={t('inventory.lowStock')}
      onRefresh={lowStock.refetch}
      isRefreshing={lowStock.isFetching}
      scrollable={false}
    >
      <FlatList<LowStockItemType>
        data={data}
        keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
        renderItem={({ item }) => <LowStockItem item={item} />}
        ListEmptyComponent={
          <EmptyState icon="✅" message={t('inventory.noLowStock')} />
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
