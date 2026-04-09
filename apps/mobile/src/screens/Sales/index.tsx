import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSalesData } from './useSalesData';
import { useAuthStore } from '../../store/auth.store';
import { useShiftStore } from '../../store/shiftStore';
import { C } from './SalesColors';
import { orderToSale } from './SalesTypes';
import type { Sale } from './SalesTypes';
import SaleRow from './SaleRow';
import SaleDetailModal from './SaleDetailModal';
import SalesListHeader from './SalesListHeader';

// ─── EmptyState ───────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🧾</Text>
      <Text style={styles.emptyText}>Bugun sotuvlar yo'q</Text>
    </View>
  );
}

// ─── SalesScreen ──────────────────────────────────────────────
export default function SalesScreen() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { orders, shiftDetail } = useSalesData();
  const { user } = useAuthStore();
  const { isShiftOpen } = useShiftStore();

  const sales = useMemo(
    () => (orders.data?.data ?? []).map(orderToSale),
    [orders.data],
  );

  const totalRevenue = useMemo(
    () => sales.reduce((s, o) => s + o.amount, 0),
    [sales],
  );

  const avgOrder = sales.length > 0
    ? Math.round(totalRevenue / sales.length)
    : 0;

  const cashierName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Kassir';

  const startTime = shiftDetail.data?.openedAt
    ? new Date(shiftDetail.data.openedAt).toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const todayLabel = new Date().toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (orders.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={C.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu-outline" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerDate}>{todayLabel}</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <SaleRow sale={item} onPress={setSelectedSale} />
        )}
        ListHeaderComponent={
          <SalesListHeader
            cashierName={cashierName}
            startTime={startTime}
            isShiftOpen={isShiftOpen}
            total={totalRevenue}
            count={sales.length}
            avg={avgOrder}
          />
        }
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <SaleDetailModal
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loader: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDate: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  content: {
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    fontWeight: '600',
  },
});
