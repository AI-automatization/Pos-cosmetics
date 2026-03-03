import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { InventoryStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { inventoryApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { useAppStore } from '@/store/app.store';
import type { StockItem } from '@/api/inventory.api';
import type { PaginatedResponse } from '@raos/types';

type Props = {
  navigation: NativeStackNavigationProp<InventoryStackParamList, 'StockLevels'>;
};

function StockRow({ item }: { item: StockItem }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.sku}>{item.sku}</Text>
        <Text style={styles.warehouse}>{item.warehouseName}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.qty, item.isLow && styles.qtyLow]}>{item.quantity}</Text>
        {item.isLow ? (
          <Badge label={t('inventory.lowStock')} variant="warning" />
        ) : (
          <Badge label={t('inventory.stock')} variant="success" />
        )}
      </View>
    </View>
  );
}

export default function StockLevelsScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();

  const EMPTY_STOCK: PaginatedResponse<StockItem> = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['inventory', 'stock', selectedBranchId],
    queryFn: safeQueryFn<PaginatedResponse<StockItem>>(() => inventoryApi.getStock(selectedBranchId ?? undefined), EMPTY_STOCK),
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.lowStockButton}
          onPress={() => navigation.navigate('LowStock')}
          accessibilityRole="button"
        >
          <Text style={styles.lowStockButtonText}>⚠️ {t('inventory.lowStock')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('BarcodeScanner')}
          accessibilityRole="button"
        >
          <Text style={styles.scanButtonText}>📷 {t('inventory.scanBarcode')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.data}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <StockRow item={item} />}
        ListEmptyComponent={<EmptyState message={t('common.noData')} icon="📦" />}
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
  buttonRow: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    gap: 8,
  },
  lowStockButton: {
    flex: 1,
    backgroundColor: '#fef9c3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  lowStockButtonText: {
    color: '#ca8a04',
    fontWeight: '600',
    fontSize: 14,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
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
  warehouse: {
    fontSize: 12,
    color: '#6b7280',
  },
  qty: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  qtyLow: {
    color: '#dc2626',
  },
  separator: {
    height: 8,
  },
});
