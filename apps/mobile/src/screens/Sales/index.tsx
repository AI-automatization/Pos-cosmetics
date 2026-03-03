import React, { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { salesApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { Sale } from '@/api/sales.api';
import type { PaginatedResponse } from '@raos/types';

type Props = {
  navigation: NativeStackNavigationProp<SalesStackParamList, 'SalesList'>;
};

function SaleRow({ item, onPress }: { item: Sale; onPress: () => void }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowContent}>
        <Text style={styles.rowId}>#{item.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.rowDate}>{formatDateTime(item.createdAt)}</Text>
        <Text style={styles.rowBranch}>{item.branchName}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowTotal}>{formatCurrency(item.total, item.currency)}</Text>
        <Badge
          label={item.status === 'COMPLETED' ? t('common.all') : item.status}
          variant={item.status === 'COMPLETED' ? 'success' : 'warning'}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function SalesListScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const EMPTY_PAGE: PaginatedResponse<Sale> = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['sales', page],
    queryFn: safeQueryFn<PaginatedResponse<Sale>>(() => salesApi.getAll({ page, limit: 20 }), EMPTY_PAGE),
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => { void refetch(); setPage(1); }}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <FlatList
        data={data?.data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SaleRow
            item={item}
            onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState message={t('common.noData')} icon="🛍️" />}
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
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  rowDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rowBranch: {
    fontSize: 12,
    color: '#6b7280',
  },
  rowTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a56db',
  },
  separator: {
    height: 8,
  },
});
