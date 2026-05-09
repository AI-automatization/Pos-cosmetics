import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Order } from '@raos/types';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api/sales.api';
import type { OrderWithMethod } from '../../api/sales.api';
import type { Sale } from '../Sales/SalesTypes';
import { orderToSale } from '../Sales/SalesTypes';
import ReturnScreen from '../Sales/ReturnScreen';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import EmptyState from '../../components/common/EmptyState';

// ─── Color tokens (Sales pattern bilan mos) ────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
} as const;

// ─── Order row ─────────────────────────────────────────────
interface OrderRowProps {
  readonly item: Order;
  readonly onPress: (item: Order) => void;
}

const OrderRow = React.memo(function OrderRow({ item, onPress }: OrderRowProps) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const dateStr = useMemo(
    () => new Date(item.createdAt).toLocaleDateString('uz-UZ'),
    [item.createdAt],
  );

  const totalStr = useMemo(
    () => Number(item.total).toLocaleString('ru-RU'),
    [item.total],
  );

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.orderNum}>
          #{String(item.orderNumber).padStart(4, '0')}
        </Text>
        <Text style={styles.orderDate}>{dateStr}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.orderTotal}>{totalStr} UZS</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>TUGALLANGAN</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Main screen ────────────────────────────────────────────
export default function SalesReturnsScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saleDetail, setSaleDetail]       = useState<OrderWithMethod | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ─── Orders query: faqat COMPLETED holatdagilar ──────────
  const ordersQuery = useQuery({
    queryKey: ['sales', 'orders-returns'],
    queryFn: async () => {
      const res = await salesApi.getOrders({ limit: 100 });
      return (res.data ?? []).filter((o: Order) => o.status === 'COMPLETED');
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // ─── Order tanlanganda detail yuklash ────────────────────
  const handleSelectOrder = useCallback(async (order: Order) => {
    setDetailLoading(true);
    try {
      const detail = await salesApi.getOrderById(order.id);
      setSaleDetail(detail);
      setSelectedOrder(order);
    } catch {
      Alert.alert('Xatolik', "Buyurtma ma'lumotlarini yuklab bo'lmadi");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ─── Modal yopish ────────────────────────────────────────
  const handleClose = useCallback(() => {
    setSelectedOrder(null);
    setSaleDetail(null);
  }, []);

  // ─── Qaytarish tasdiqlash ────────────────────────────────
  const handleConfirm = useCallback(
    async (
      selectedIndexes: number[],
      qtys: Record<number, number>,
      reason: string,
    ) => {
      if (!selectedOrder || !saleDetail) return;

      const items = selectedIndexes.map((idx) => ({
        orderItemId: saleDetail.items[idx]!.id,
        productId:   saleDetail.items[idx]!.productId,
        quantity:    qtys[idx] ?? 1,
      }));

      try {
        await salesApi.returnOrder(selectedOrder.id, { items, reason });
        Alert.alert('Muvaffaqiyatli', 'Qaytarish amalga oshirildi', [
          { text: 'OK', onPress: handleClose },
        ]);
        void ordersQuery.refetch();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
        Alert.alert('Xatolik', `Qaytarishni amalga oshirib bo'lmadi: ${msg}`);
      }
    },
    [selectedOrder, saleDetail, ordersQuery, handleClose],
  );

  // ─── OrderWithMethod → Sale (ReturnScreen uchun) ─────────
  const sale = useMemo<Sale | null>(() => {
    if (!saleDetail) return null;
    return orderToSale(saleDetail);
  }, [saleDetail]);

  // ─── FlatList renderItem ──────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderRow item={item} onPress={handleSelectOrder} />
    ),
    [handleSelectOrder],
  );

  const keyExtractor = useCallback((item: Order) => item.id, []);

  // ─── Loading / Error states ───────────────────────────────
  if (ordersQuery.isLoading) return <LoadingSpinner />;
  if (ordersQuery.isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView error={ordersQuery.error} onRetry={ordersQuery.refetch} />
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Qaytarishlar</Text>
        {ordersQuery.isFetching && !ordersQuery.isLoading && (
          <ActivityIndicator size="small" color={C.primary} />
        )}
      </View>

      {/* Detail yuklanish overlay */}
      {detailLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}

      {/* Orders ro'yxati */}
      <FlatList<Order>
        data={ordersQuery.data ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title="Qaytarish mumkin bo'lgan buyurtmalar yo'q"
            description="Tugallangan sotuv buyurtmalari bu yerda ko'rinadi"
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* ReturnScreen modal */}
      {sale !== null && selectedOrder !== null && (
        <View style={StyleSheet.absoluteFill}>
          <ReturnScreen
            sale={sale}
            onClose={handleClose}
            onConfirm={handleConfirm}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  row: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
    // Android shadow
    elevation: 2,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  rowLeft: {
    gap: 4,
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    fontVariant: ['tabular-nums'],
  },
  orderDate: {
    fontSize: 12,
    color: C.muted,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.green,
    letterSpacing: 0.5,
  },
});
