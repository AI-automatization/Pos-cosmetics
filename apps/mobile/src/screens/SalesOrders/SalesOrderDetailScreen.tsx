import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrderStatus } from '@raos/types';
import { salesApi } from '../../api';
import type { SalesOrdersStackParamList } from '../../navigation/types';
import { Colors, Radii, Shadows } from '../../config/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';

type Props = NativeStackScreenProps<SalesOrdersStackParamList, 'SalesOrderDetail'>;

interface StatusConfig {
  readonly label: string;
  readonly color: string;
}

const STATUS_CFG: Record<OrderStatus, StatusConfig> = {
  COMPLETED: { label: 'Bajarilgan',      color: Colors.success },
  RETURNED:  { label: 'Qaytarilgan',     color: Colors.warning },
  VOIDED:    { label: 'Bekor qilingan',  color: Colors.danger },
};

interface RowProps {
  readonly label: string;
  readonly value: string;
  readonly valueColor?: string;
  readonly bold?: boolean;
}

function DetailRow({ label, value, valueColor, bold }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          valueColor ? { color: valueColor } : undefined,
          bold ? styles.valueBold : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function SalesOrderDetailScreen({ route }: Props) {
  const { orderId, orderNumber } = route.params;

  const query = useQuery({
    queryKey: ['sales', 'order-detail', orderId],
    queryFn: () => salesApi.getOrderById(orderId),
    staleTime: 30_000,
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError || !query.data) {
    return (
      <ErrorView
        error={query.error}
        onRetry={() => { void query.refetch(); }}
      />
    );
  }

  const order = query.data;
  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.COMPLETED;
  const total = Number(order.total).toLocaleString('uz-UZ');
  const subtotal = Number(order.subtotal).toLocaleString('uz-UZ');
  const discount = Number(order.discountAmount).toLocaleString('uz-UZ');
  const tax = Number(order.taxAmount).toLocaleString('uz-UZ');
  const date = new Date(order.createdAt).toLocaleString('uz-UZ');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Buyurtma #{orderNumber}</Text>

        <View style={styles.card}>
          <DetailRow label="Holat"    value={cfg.label}           valueColor={cfg.color} />
          <DetailRow label="Sana"     value={date} />
          <DetailRow label="Jami"     value={`${total} so'm`}     bold />
          <DetailRow label="Subtotal" value={`${subtotal} so'm`} />
          <DetailRow label="Chegirma" value={`-${discount} so'm`} />
          <DetailRow label="Soliq"    value={`${tax} so'm`} />
        </View>

        {order.items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Mahsulotlar ({order.items.length})
            </Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQty}>
                    {item.quantity} x {Number(item.unitPrice).toLocaleString('uz-UZ')}
                  </Text>
                  <Text style={styles.itemTotal}>
                    {Number(item.total).toLocaleString('uz-UZ')} so'm
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {order.notes != null && order.notes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Izoh</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  valueBold: {
    fontWeight: '700',
    fontSize: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notes: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
