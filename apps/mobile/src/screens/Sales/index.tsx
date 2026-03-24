import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
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

interface Sale {
  id: string;
  num: number;
  time: string;
  items: number;
  amount: number;
  method: PayMethod;
}

const SALES: Sale[] = [
  { id: '1', num: 10245, time: '14:20', items: 3,  amount: 125_000,  method: 'NAQD'   },
  { id: '2', num: 10244, time: '14:05', items: 1,  amount: 45_000,   method: 'KARTA'  },
  { id: '3', num: 10243, time: '13:50', items: 12, amount: 840_000,  method: 'NASIYA' },
  { id: '4', num: 10242, time: '13:32', items: 2,  amount: 32_500,   method: 'KARTA'  },
  { id: '5', num: 10241, time: '12:15', items: 5,  amount: 210_000,  method: 'NAQD'   },
  { id: '6', num: 10240, time: '11:48', items: 3,  amount: 95_000,   method: 'NAQD'   },
  { id: '7', num: 10239, time: '11:20', items: 8,  amount: 560_000,  method: 'KARTA'  },
  { id: '8', num: 10238, time: '10:55', items: 2,  amount: 78_000,   method: 'NASIYA' },
  { id: '9', num: 10237, time: '10:30', items: 4,  amount: 310_000,  method: 'NAQD'   },
  { id:'10', num: 10236, time: '09:58', items: 6,  amount: 445_000,  method: 'KARTA'  },
];

const METHOD_STYLE: Record<PayMethod, { bg: string; text: string; label: string }> = {
  NAQD:   { bg: '#D1FAE5', text: '#059669', label: 'NAQD'   },
  KARTA:  { bg: '#DBEAFE', text: '#2563EB', label: 'KARTA'  },
  NASIYA: { bg: '#FEF3C7', text: '#D97706', label: 'NASIYA' },
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

function SaleRow({ sale }: { sale: Sale }) {
  const m = METHOD_STYLE[sale.method];
  return (
    <TouchableOpacity style={styles.saleRow} activeOpacity={0.75}>
      <View style={styles.saleLeft}>
        <Text style={styles.saleNum}>#{sale.num}</Text>
        <Text style={styles.saleMeta}>{sale.time}  ·  {sale.items} ta mahsulot</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleAmount}>{fmt(sale.amount)}</Text>
        <View style={[styles.methodBadge, { backgroundColor: m.bg }]}>
          <Text style={[styles.methodText, { color: m.text }]}>{m.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
        renderItem={({ item }) => <SaleRow sale={item} />}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
});
