import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrderItem, Order } from '@raos/types';
import type { SalesStackParamList } from '../../navigation/types';
import { salesApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import Badge from '../../components/common/Badge';
import { formatUZS } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<SalesStackParamList, 'SaleDetail'>;

export default function SaleDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { orderId } = route.params;
  const qc = useQueryClient();

  const order = useQuery({
    queryKey: ['sales', 'order', orderId],
    queryFn: () => salesApi.getOrderById(orderId),
    placeholderData: () => {
      const today = new Date().toISOString().split('T')[0] ?? '';
      const cached = qc.getQueryData<{ data: Order[] }>(['sales', 'orders', today]);
      return cached?.data.find((o) => o.id === orderId);
    },
  });

  if (order.isLoading) return <LoadingSpinner />;
  if (order.error || !order.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title={t('sales.detail')} onBack={() => navigation.goBack()} />
        <ErrorView error={order.error} onRetry={order.refetch} />
      </SafeAreaView>
    );
  }

  const data = order.data;
  const hasDiscount = data.discountAmount > 0;
  const hasTax = data.taxAmount > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={`${t('sales.order')} #${data.orderNumber}`}
        onBack={() => navigation.goBack()}
      />

      <FlatList<OrderItem>
        data={data.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaDate}>{formatDateTime(data.createdAt)}</Text>
              <Badge
                label={data.status}
                variant={data.status === 'COMPLETED' ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.itemsTitle}>{t('sales.items')}</Text>
          </View>
        }
        renderItem={({ item }) => <OrderItemRow item={item} t={t} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('sales.noItems')}</Text>
        }
        ListFooterComponent={
          <View style={styles.summary}>
            <SummaryRow label={t('sales.subtotal')} value={formatUZS(data.subtotal)} />
            {hasDiscount && (
              <SummaryRow
                label={t('sales.discount')}
                value={`-${formatUZS(data.discountAmount)}`}
                valueStyle={styles.discountValue}
              />
            )}
            {hasTax && (
              <SummaryRow label={t('sales.tax')} value={formatUZS(data.taxAmount)} />
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('sales.total')}</Text>
              <Text style={styles.totalValue}>{formatUZS(data.total)}</Text>
            </View>
            {data.fiscalStatus !== 'NONE' && (
              <View style={styles.fiscalRow}>
                <Text style={styles.fiscalLabel}>{t('sales.fiscalStatus')}</Text>
                <Badge
                  label={data.fiscalStatus}
                  variant={data.fiscalStatus === 'SENT' ? 'success' : 'warning'}
                />
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function OrderItemRow({ item, t }: { item: OrderItem; t: (key: string) => string }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.itemQty}>
          {item.quantity} {t('sales.qty')} × {formatUZS(item.unitPrice)}
        </Text>
      </View>
      <Text style={styles.itemTotal}>{formatUZS(item.total)}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: '#6366F1', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  content: { padding: 16, gap: 8 },
  meta: { marginBottom: 8 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaDate: { fontSize: 13, color: '#6B7280' },
  itemsTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  itemQty: { fontSize: 12, color: '#6B7280' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#374151' },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 16 },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#374151' },
  discountValue: { color: '#16A34A' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 6,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#6366F1' },
  fiscalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  fiscalLabel: { fontSize: 13, color: '#6B7280' },
});
