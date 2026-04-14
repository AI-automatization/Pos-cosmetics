import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { inventoryApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { useAppStore } from '@/store/app.store';
import type { StockItem } from '@/api/inventory.api';

function LowStockRow({ item }: { item: StockItem }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.sku}>{item.sku}</Text>
        <Text style={styles.threshold}>
          {t('inventory.threshold')}: {item.threshold}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.qty}>{item.quantity}</Text>
        <Text style={styles.qtyLabel}>{t('inventory.quantity')}</Text>
      </View>
    </View>
  );
}

export default function LowStockScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['inventory', 'low-stock', selectedBranchId],
    queryFn: safeQueryFn<StockItem[]>(() => inventoryApi.getLowStock(selectedBranchId ?? undefined), []),
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <LowStockRow item={item} />}
        ListEmptyComponent={<EmptyState title={t('common.noData')} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sku: {
    fontSize: 12,
    color: '#9ca3af',
  },
  threshold: {
    fontSize: 12,
    color: '#ca8a04',
  },
  qty: {
    fontSize: 28,
    fontWeight: '800',
    color: '#dc2626',
  },
  qtyLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  separator: {
    height: 8,
  },
});
