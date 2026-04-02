import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Order, OrderItem } from '@raos/types';
import { useSalesData } from './useSalesData';
import { useAuthStore } from '../../store/auth.store';
import { useShiftStore } from '../../store/shiftStore';

// ─── Colors ───────────────────────────────────────────
const C = {
  bg:       '#F5F5F7',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  secondary:'#6B7280',
  border:   '#F3F4F6',
  primary:  '#5B5BD6',
  green:    '#10B981',
};

// ─── Types ────────────────────────────────────────────
type PayMethod = 'NAQD' | 'KARTA' | 'NASIYA' | 'ARALASH';

interface Payment {
  method: PayMethod;
  amount: number;
}

interface SaleProduct {
  name: string;
  qty: number;
  price: number;
}

interface Sale {
  id: string;
  num: number;
  time: string;
  items: number;
  amount: number;
  payments: Payment[];
  products: SaleProduct[];
}

// ─── Helpers ──────────────────────────────────────────
const METHOD_STYLE: Record<PayMethod, { bg: string; text: string; label: string; icon: string }> = {
  NAQD:    { bg: '#D1FAE5', text: '#059669', label: 'NAQD',    icon: '💵' },
  KARTA:   { bg: '#DBEAFE', text: '#2563EB', label: 'KARTA',   icon: '💳' },
  NASIYA:  { bg: '#FEF3C7', text: '#D97706', label: 'NASIYA',  icon: '🕐' },
  ARALASH: { bg: '#F3F4F6', text: '#374151', label: 'ARALASH', icon: '🔀' },
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU');
}

function fmtStat(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function parsePayment(order: Order): Payment[] {
  const notes = order.notes ?? '';
  if (notes.includes('ARALASH')) return [{ method: 'ARALASH', amount: order.total }];
  if (notes.includes('KARTA'))   return [{ method: 'KARTA',   amount: order.total }];
  if (notes.includes('NASIYA'))  return [{ method: 'NASIYA',  amount: order.total }];
  return [{ method: 'NAQD', amount: order.total }];
}

function orderToSale(order: Order): Sale {
  return {
    id: order.id,
    num: order.orderNumber,
    time: new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    items: order.items.length,
    amount: order.total,
    payments: parsePayment(order),
    products: order.items.map((item: OrderItem) => ({
      name: item.productName,
      qty: item.quantity,
      price: item.unitPrice,
    })),
  };
}

// ─── Sub-components ───────────────────────────────────
function ShiftCard({ cashierName, startTime }: { cashierName: string; startTime: string }) {
  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftLeft}>
        <View style={styles.shiftDot} />
        <View>
          <Text style={styles.shiftCashier}>Faol smena: {cashierName}</Text>
          <Text style={styles.shiftTime}>Boshlanish vaqti: {startTime}</Text>
        </View>
      </View>
    </View>
  );
}

function StatsGrid({ total, count, avg }: { total: number; count: number; avg: number }) {
  const stats = [
    { label: 'TUSHUM',   value: fmtStat(total) },
    { label: 'SONI',     value: `${count} ta` },
    { label: "O'RTACHA", value: fmtStat(avg) },
  ];
  return (
    <View style={styles.statsGrid}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.statDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

function PayBadge({ payment }: { payment: Payment }) {
  const m = METHOD_STYLE[payment.method];
  return (
    <View style={[styles.methodBadge, { backgroundColor: m.bg }]}>
      <Text style={[styles.methodText, { color: m.text }]}>{m.icon} {m.label}</Text>
    </View>
  );
}

function SaleRow({ sale, onPress }: { sale: Sale; onPress: (s: Sale) => void }) {
  return (
    <TouchableOpacity style={styles.saleRow} activeOpacity={0.75} onPress={() => onPress(sale)}>
      <View style={styles.saleLeft}>
        <Text style={styles.saleNum}>#{sale.num}</Text>
        <Text style={styles.saleMeta}>{sale.time}  ·  {sale.items} ta mahsulot</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleAmount}>{fmt(sale.amount)}</Text>
        <PayBadge payment={sale.payments[0]!} />
      </View>
    </TouchableOpacity>
  );
}

function SaleDetailModal({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  if (!sale) return null;
  const payment = sale.payments[0]!;
  const m = METHOD_STYLE[payment.method];
  return (
    <Modal
      visible={!!sale}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalOrderNum}>#{sale.num}</Text>
              <Text style={styles.modalTime}>{sale.time}</Text>
            </View>
            <View style={[styles.modalMethodBadge, { backgroundColor: m.bg }]}>
              <Text style={styles.modalMethodIcon}>{m.icon}</Text>
              <Text style={[styles.modalMethodText, { color: m.text }]}>{m.label}</Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          {/* Products */}
          <Text style={styles.modalSectionTitle}>Mahsulotlar</Text>
          <ScrollView style={styles.modalProductList} showsVerticalScrollIndicator={false}>
            {sale.products.map((p, i) => (
              <View key={i} style={styles.modalProductRow}>
                <View style={styles.modalProductLeft}>
                  <Text style={styles.modalProductName}>{p.name}</Text>
                  <Text style={styles.modalProductQty}>{p.qty} dona</Text>
                </View>
                <Text style={styles.modalProductPrice}>{fmt(p.price * p.qty)} so'm</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalDivider} />

          {/* Payment */}
          <Text style={styles.modalSectionTitle}>To'lov</Text>
          <View style={styles.modalPayRow}>
            <View style={[styles.modalPayBadge, { backgroundColor: m.bg }]}>
              <Text style={[styles.modalPayBadgeText, { color: m.text }]}>{m.icon} {m.label}</Text>
            </View>
            <Text style={[styles.modalPayAmount, { color: m.text }]}>{fmt(payment.amount)} so'm</Text>
          </View>

          <View style={styles.modalDivider} />

          {/* Total */}
          <View style={styles.modalTotalRow}>
            <Text style={styles.modalTotalLabel}>Jami</Text>
            <Text style={styles.modalTotalValue}>{fmt(sale.amount)} so'm</Text>
          </View>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.modalCloseBtnText}>Yopish</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🧾</Text>
      <Text style={styles.emptyText}>Bugun sotuvlar yo'q</Text>
    </View>
  );
}

interface ListHeaderProps {
  cashierName: string;
  startTime: string;
  isShiftOpen: boolean;
  total: number;
  count: number;
  avg: number;
}
function ListHeader({ cashierName, startTime, isShiftOpen, total, count, avg }: ListHeaderProps) {
  return (
    <View style={styles.listHeader}>
      {isShiftOpen && <ShiftCard cashierName={cashierName} startTime={startTime} />}
      <StatsGrid total={total} count={count} avg={avg} />

      {/* Section title */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Sotuvlar tarixi</Text>
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function SalesScreen() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { orders, shiftDetail } = useSalesData();
  const { user } = useAuthStore();
  const { isShiftOpen } = useShiftStore();

  const sales = useMemo(
    () => (orders.data?.data ?? []).map(orderToSale),
    [orders.data],
  );

  const totalRevenue = useMemo(() => sales.reduce((s, o) => s + o.amount, 0), [sales]);
  const avgOrder = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;

  const cashierName = user ? `${user.firstName} ${user.lastName}` : 'Kassir';
  const startTime = shiftDetail.data?.openedAt
    ? new Date(shiftDetail.data.openedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const todayLabel = new Date().toLocaleDateString('uz-UZ', {
    day: 'numeric', month: 'long', year: 'numeric',
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
      {/* Header */}
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
        renderItem={({ item }) => <SaleRow sale={item} onPress={setSelectedSale} />}
        ListHeaderComponent={
          <ListHeader
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

      <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1 },

  // Header
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

  // List
  content: { paddingBottom: 32 },
  listHeader: { padding: 16, gap: 12 },
  separator: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },

  // Shift card
  shiftCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: C.green,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  shiftLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  shiftDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.green,
  },
  shiftCashier: { fontSize: 14, fontWeight: '700', color: C.text },
  shiftTime: { fontSize: 12, color: C.secondary, marginTop: 2 },

  // Stats
  statsGrid: {
    backgroundColor: C.white,
    borderRadius: 14,
    flexDirection: 'row',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted, letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // Section
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text },

  // Sale row
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.white,
  },
  saleLeft: { gap: 4 },
  saleNum: { fontSize: 15, fontWeight: '700', color: C.text },
  saleMeta: { fontSize: 12, color: C.secondary },
  saleRight: { alignItems: 'flex-end', gap: 6 },
  saleAmount: { fontSize: 15, fontWeight: '700', color: C.text },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  methodText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalOrderNum: { fontSize: 20, fontWeight: '800', color: C.text },
  modalTime: { fontSize: 13, color: C.secondary, marginTop: 2 },
  modalMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalMethodIcon: { fontSize: 16 },
  modalMethodText: { fontSize: 14, fontWeight: '700' },
  modalDivider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  modalProductList: { maxHeight: 220 },
  modalProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalProductLeft: { flex: 1, gap: 2 },
  modalProductName: { fontSize: 14, fontWeight: '600', color: C.text },
  modalProductQty: { fontSize: 12, color: C.muted },
  modalProductPrice: { fontSize: 14, fontWeight: '700', color: C.primary },
  modalPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalPayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalPayBadgeText: { fontSize: 13, fontWeight: '700' },
  modalPayAmount: { fontSize: 15, fontWeight: '700' },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTotalLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  modalTotalValue: { fontSize: 20, fontWeight: '800', color: C.primary },
  modalCloseBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
