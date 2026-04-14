import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSalesData } from './useSalesData';
import { useAuthStore } from '../../store/auth.store';
import { useShiftStore } from '../../store/shiftStore';
import { C } from './SalesColors';
import { orderToSale, type OrderStatus } from './SalesTypes';
import type { Sale } from './SalesTypes';
import SaleRow from './SaleRow';
import SaleDetailModal from './SaleDetailModal';
import SalesListHeader from './SalesListHeader';

// ─── Filter config ─────────────────────────────────────────────
type FilterKey = 'ALL' | OrderStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL',       label: 'Barchasi' },
  { key: 'COMPLETED', label: 'Bajarildi' },
  { key: 'RETURNED',  label: 'Qaytarildi' },
  { key: 'VOIDED',    label: 'Bekor qilindi' },
];

// ─── EmptyState ───────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={40} color={C.muted} />
      <Text style={styles.emptyText}>Sotuvlar yo'q</Text>
    </View>
  );
}

// ─── SalesScreen ──────────────────────────────────────────────
export default function SalesScreen() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const { orders, shiftDetail } = useSalesData();
  const { user } = useAuthStore();
  const { isShiftOpen } = useShiftStore();

  const sales = useMemo(
    () => (orders.data?.data ?? []).map(orderToSale),
    [orders.data],
  );

  const filteredSales = useMemo(
    () => filter === 'ALL' ? sales : sales.filter((s) => s.status === filter),
    [sales, filter],
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

  if (orders.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={C.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buyurtmalar tarixi</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredSales}
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
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    fontWeight: '600',
  },
});
