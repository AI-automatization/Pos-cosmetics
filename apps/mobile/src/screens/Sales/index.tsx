import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

// ─── Mock data ────────────────────────────────────────
const SHIFT = {
  cashier:   'Azamat Akhmedov',
  startTime: '08:30',
};

const STATS = [
  { label: 'TUSHUM',   value: '4.2M' },
  { label: 'SONI',     value: '48 ta' },
  { label: "O'RTACHA", value: '88.5k' },
];

type PayMethod = 'NAQD' | 'KARTA' | 'NASIYA';

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

const SALES: Sale[] = [
  { id: '1', num: 10245, time: '14:20', items: 3,  amount: 125_000,
    payments: [{ method: 'NAQD', amount: 125_000 }],
    products: [{ name: 'Labello Classic', qty: 2, price: 35_000 }, { name: 'Nivea Krem', qty: 1, price: 55_000 }] },
  { id: '2', num: 10244, time: '14:05', items: 1,  amount: 45_000,
    payments: [{ method: 'KARTA', amount: 45_000 }],
    products: [{ name: "L'Oreal Shampun", qty: 1, price: 45_000 }] },
  { id: '3', num: 10243, time: '13:50', items: 12, amount: 840_000,
    payments: [{ method: 'NAQD', amount: 300_000 }, { method: 'KARTA', amount: 290_000 }, { method: 'NASIYA', amount: 250_000 }],
    products: [{ name: 'Maybelline Pomada', qty: 4, price: 80_000 }, { name: 'NYX Liner', qty: 3, price: 120_000 }, { name: 'Essence Tush', qty: 5, price: 28_000 }] },
  { id: '4', num: 10242, time: '13:32', items: 2,  amount: 32_500,
    payments: [{ method: 'KARTA', amount: 32_500 }],
    products: [{ name: 'Dove Gel', qty: 1, price: 18_000 }, { name: 'Pantene Balzam', qty: 1, price: 14_500 }] },
  { id: '5', num: 10241, time: '12:15', items: 5,  amount: 250_000,
    payments: [{ method: 'NAQD', amount: 100_000 }, { method: 'KARTA', amount: 100_000 }, { method: 'NASIYA', amount: 50_000 }],
    products: [{ name: 'Chanel Atir', qty: 1, price: 150_000 }, { name: 'Revlon Tush', qty: 2, price: 30_000 }, { name: "Q'o'l kremi", qty: 2, price: 10_000 }] },
  { id: '6', num: 10240, time: '11:48', items: 3,  amount: 95_000,
    payments: [{ method: 'NAQD', amount: 95_000 }],
    products: [{ name: 'Garnier Tonik', qty: 1, price: 55_000 }, { name: 'Vichy Krem', qty: 2, price: 20_000 }] },
  { id: '7', num: 10239, time: '11:20', items: 8,  amount: 560_000,
    payments: [{ method: 'NAQD', amount: 200_000 }, { method: 'KARTA', amount: 360_000 }],
    products: [{ name: 'MAC Pomada', qty: 3, price: 120_000 }, { name: 'Urban Decay', qty: 2, price: 80_000 }, { name: 'NARS Foundation', qty: 1, price: 200_000 }] },
  { id: '8', num: 10238, time: '10:55', items: 2,  amount: 78_000,
    payments: [{ method: 'NASIYA', amount: 78_000 }],
    products: [{ name: 'Clinique Tonik', qty: 1, price: 48_000 }, { name: 'La Roche Krem', qty: 1, price: 30_000 }] },
  { id: '9', num: 10237, time: '10:30', items: 4,  amount: 310_000,
    payments: [{ method: 'NAQD', amount: 310_000 }],
    products: [{ name: 'Dior Atir', qty: 1, price: 220_000 }, { name: 'YSL Pomada', qty: 2, price: 45_000 }] },
  { id:'10', num: 10236, time: '09:58', items: 6,  amount: 445_000,
    payments: [{ method: 'KARTA', amount: 445_000 }],
    products: [{ name: 'Lancome Foundation', qty: 1, price: 280_000 }, { name: 'Benefit Tush', qty: 2, price: 65_000 }, { name: 'Charlotte Tilbury', qty: 1, price: 35_000 }] },
];

const METHOD_STYLE: Record<PayMethod, { bg: string; text: string; label: string; icon: string }> = {
  NAQD:   { bg: '#D1FAE5', text: '#059669', label: 'NAQD',   icon: '💵' },
  KARTA:  { bg: '#DBEAFE', text: '#2563EB', label: 'KARTA',  icon: '💳' },
  NASIYA: { bg: '#FEF3C7', text: '#D97706', label: 'NASIYA', icon: '🕐' },
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU');
}

// ─── Sub-components ───────────────────────────────────
function ShiftCard() {
  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftLeft}>
        <View style={styles.shiftDot} />
        <View>
          <Text style={styles.shiftCashier}>Faol smena: {SHIFT.cashier}</Text>
          <Text style={styles.shiftTime}>Boshlanish vaqti: {SHIFT.startTime}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.shiftCloseBtn} activeOpacity={0.8}>
        <Text style={styles.shiftCloseText}>Yopish</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatsGrid() {
  return (
    <View style={styles.statsGrid}>
      {STATS.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
          {i < STATS.length - 1 && <View style={styles.statDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

function PayBadges({ payments }: { payments: Payment[] }) {
  if (payments.length === 1) {
    const m = METHOD_STYLE[payments[0].method];
    return (
      <View style={[styles.methodBadge, { backgroundColor: m.bg }]}>
        <Text style={[styles.methodText, { color: m.text }]}>{m.icon} {m.label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.mixedBadgeRow}>
      {payments.map((p) => {
        const m = METHOD_STYLE[p.method];
        return (
          <View key={p.method} style={[styles.methodBadge, { backgroundColor: m.bg }]}>
            <Text style={[styles.methodText, { color: m.text }]}>{m.icon}</Text>
          </View>
        );
      })}
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
        <PayBadges payments={sale.payments} />
      </View>
    </TouchableOpacity>
  );
}

function SaleDetailModal({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  if (!sale) return null;
  const isMulti = sale.payments.length > 1;
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
            {isMulti ? (
              <View style={styles.mixedBadgeLarge}>
                <Text style={styles.mixedBadgeLargeText}>🔀 ARALASH</Text>
              </View>
            ) : (
              <View style={[styles.modalMethodBadge, { backgroundColor: METHOD_STYLE[sale.payments[0].method].bg }]}>
                <Text style={styles.modalMethodIcon}>{METHOD_STYLE[sale.payments[0].method].icon}</Text>
                <Text style={[styles.modalMethodText, { color: METHOD_STYLE[sale.payments[0].method].text }]}>
                  {METHOD_STYLE[sale.payments[0].method].label}
                </Text>
              </View>
            )}
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

          {/* Payment breakdown */}
          <Text style={styles.modalSectionTitle}>To'lov</Text>
          {sale.payments.map((p) => {
            const m = METHOD_STYLE[p.method];
            return (
              <View key={p.method} style={styles.modalPayRow}>
                <View style={[styles.modalPayBadge, { backgroundColor: m.bg }]}>
                  <Text style={[styles.modalPayBadgeText, { color: m.text }]}>{m.icon} {m.label}</Text>
                </View>
                <Text style={[styles.modalPayAmount, { color: m.text }]}>{fmt(p.amount)} so'm</Text>
              </View>
            );
          })}

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

function ListHeader() {
  return (
    <View style={styles.listHeader}>
      <ShiftCard />
      <StatsGrid />

      {/* Section title */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Sotuvlar tarixi</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.sectionAll}>Barchasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function SalesScreen() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu-outline" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerDate}>10 mart, 2026</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={SALES}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => <SaleRow sale={item} onPress={setSelectedSale} />}
        ListHeaderComponent={<ListHeader />}
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
  shiftCloseBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  shiftCloseText: { fontSize: 13, fontWeight: '700', color: C.secondary },

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
  sectionAll: { fontSize: 14, fontWeight: '600', color: C.primary },

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
  mixedBadgeRow: { flexDirection: 'row', gap: 4 },
  mixedBadgeLarge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mixedBadgeLargeText: { fontSize: 13, fontWeight: '700', color: '#374151' },
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
