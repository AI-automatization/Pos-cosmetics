import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import type { RealEstateStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Badge from '@/components/common/Badge';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { realEstateApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { QUERY_STALE_TIMES } from '@/config/constants';
import type { RentalPayment, PaymentStatus } from '@/api/realestate.api';

type Props = {
  route: RouteProp<RealEstateStackParamList, 'RentalPayments'>;
};

const PAYMENT_VARIANT: Record<PaymentStatus, 'success' | 'warning' | 'error'> = {
  PAID: 'success',
  PENDING: 'warning',
  OVERDUE: 'error',
};

function PaymentRow({
  item,
  t,
}: {
  item: RentalPayment;
  t: (key: string) => string;
}): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.month}>{item.month}</Text>
        <Text style={styles.tenant}>{item.tenantName}</Text>
        <Text style={styles.dueDate}>
          {t('realestate.due')}: {formatDateTime(item.dueDate)}
        </Text>
        {item.paidDate ? (
          <Text style={styles.paidDate}>✅ {formatDateTime(item.paidDate)}</Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.amount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <Badge
          label={t(`realestate.payment${item.status}`)}
          variant={PAYMENT_VARIANT[item.status]}
        />
      </View>
    </View>
  );
}

export default function RentalPaymentsScreen({ route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { propertyId } = route.params;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['realestate', 'payments', propertyId],
    queryFn: () => realEstateApi.getRentalPayments(propertyId),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout onRefresh={() => void refetch()} isRefreshing={isFetching} scrollable={false}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PaymentRow item={item} t={t} />}
        ListEmptyComponent={
          <EmptyState message={t('realestate.noPayments')} icon="💳" />
        }
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
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },
  month: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  tenant: {
    fontSize: 13,
    color: '#374151',
  },
  dueDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  paidDate: {
    fontSize: 12,
    color: '#059669',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  separator: {
    height: 8,
  },
});
