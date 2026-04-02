import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorView from '@/components/common/ErrorView';
import { salesApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { SaleItem } from '@/api/sales.api';

type Props = NativeStackScreenProps<RootStackParamList, 'SaleDetail'>;

function ItemRow({ item }: { item: SaleItem }): React.JSX.Element {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemQty}>x{item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
    </View>
  );
}

export default function SaleDetailScreen({ route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { saleId } = route.params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => salesApi.getById(saleId),
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error || !data) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout>
      <Card>
        <Text style={styles.label}>{t('sales.date')}</Text>
        <Text style={styles.value}>{formatDateTime(data.createdAt)}</Text>

        <Text style={styles.label}>{t('sales.branch')}</Text>
        <Text style={styles.value}>{data.branchName}</Text>

        <Text style={styles.label}>{t('sales.cashier')}</Text>
        <Text style={styles.value}>{data.cashierName}</Text>

        <Text style={styles.label}>{t('sales.paymentMethod')}</Text>
        <Text style={styles.value}>{data.paymentMethod}</Text>
      </Card>

      <Text style={styles.sectionTitle}>{t('sales.items')}</Text>
      <Card>
        <FlatList
          data={data.items}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => <ItemRow item={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('sales.total')}</Text>
          <Text style={styles.totalValue}>{formatCurrency(data.total, data.currency)}</Text>
        </View>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  itemQty: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a56db',
  },
});
