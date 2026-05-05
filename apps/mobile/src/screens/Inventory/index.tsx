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
import type { InventoryItem } from '../../api/inventory.api';

export default function InventoryScreen() {
  const { t } = useTranslation();
  const { allStock } = useInventoryData();

  if (allStock.isLoading) return <LoadingSpinner />;
  if (allStock.error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView error={allStock.error} onRetry={allStock.refetch} />
      </SafeAreaView>
    );
  }

  const data = allStock.data ?? [];

  return (
    <ScreenLayout
      title={t('inventory.title')}
      onRefresh={allStock.refetch}
      isRefreshing={allStock.isFetching}
      scrollable={false}
    >
      <FlatList<InventoryItem>
        data={data}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <LowStockItem item={item} />}
        ListEmptyComponent={
          <EmptyState title={t('inventory.noLowStock')} />
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
