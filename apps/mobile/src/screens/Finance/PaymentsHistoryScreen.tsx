import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api/sales.api';
import SearchBar from '../../components/common/SearchBar';
import ErrorView from '@/components/common/ErrorView';
import type { OrderStatus } from '@raos/types';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
};

// ─── Period config ─────────────────────────────────────
type PeriodKey = 'today' | '7d' | '30d' | '90d';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d',    label: '7 kun' },
  { key: '30d',   label: '30 kun' },
  { key: '90d',   label: '90 kun' },
];

function getPeriodDates(key: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  switch (key) {
    case 'today': from.setHours(0, 0, 0, 0); break;
    case '7d':    from.setDate(now.getDate() - 6); break;
    case '30d':   from.setDate(now.getDate() - 29); break;
    case '90d':   from.setDate(now.getDate() - 89); break;
  }
  return { from: from.toISOString().split('T')[0]!, to };
}

// ─── Method filter ─────────────────────────────────────
type MethodKey = 'Barchasi' | 'Naqd' | 'Karta' | 'Nasiya' | 'Click' | 'Payme';

const METHODS: { key: MethodKey; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'Barchasi', icon: 'apps-outline' },
  { key: 'Naqd',    icon: 'cash-outline' },
  { key: 'Karta',   icon: 'card-outline' },
  { key: 'Nasiya',  icon: 'time-outline' },
  { key: 'Click',   icon: 'phone-portrait-outline' },
  { key: 'Payme',   icon: 'logo-bitcoin' },
];

// ─── Status config ─────────────────────────────────────
const STATUS_STYLE: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: 'Bajarildi', color: C.green,   bg: '#F0FDF4' },
  RETURNED:  { label: 'Qaytarildi', color: C.orange, bg: '#FFFBEB' },
  VOIDED:    { label: 'Bekor',      color: C.red,    bg: '#FEF2F2' },
};

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

// ─── PaymentCard ───────────────────────────────────────
function PaymentCard({
  orderNumber,
  status,
  total,
  createdAt,
  customerId,
}: {
  orderNumber: number;
  status: OrderStatus;
  total: number;
  createdAt: Date | string;
  customerId: string | null;
}) {
  const s = STATUS_STYLE[status];
  const isReturn = status === 'RETURNED';

  return (
    <View style={styles.card}>
      {/* Left: icon */}
      <View style={[styles.cardIcon, { backgroundColor: s.bg }]}>
        <Ionicons
          name={status === 'COMPLETED' ? 'checkmark-circle-outline' : status === 'RETURNED' ? 'return-down-back-outline' : 'close-circle-outline'}
          size={20}
          color={s.color}
        />
      </View>

      {/* Middle: info */}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardOrderNum}>
            #{String(orderNumber).padStart(4, '0')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <Ionicons name="time-outline" size={12} color={C.muted} />
          <Text style={styles.cardMetaText}>{formatDate(createdAt)} {formatTime(createdAt)}</Text>
        </View>
        {customerId && (
          <View style={styles.cardMeta}>
            <Ionicons name="person-outline" size={12} color={C.muted} />
            <Text style={styles.cardMetaText} numberOfLines={1}>
              Mijoz: {customerId.slice(0, 8)}…
            </Text>
          </View>
        )}
      </View>

      {/* Right: amount */}
      <Text style={[styles.cardAmount, { color: isReturn ? C.red : C.text }]}>
        {isReturn ? '−' : ''}{fmt(total)}
      </Text>
    </View>
  );
}

// ─── PaymentsHistoryScreen ─────────────────────────────
export default function PaymentsHistoryScreen() {
  const [period, setPeriod]     = useState<PeriodKey>('30d');
  const [method, setMethod]     = useState<MethodKey>('Barchasi');
  const [search, setSearch]     = useState('');

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', from, to],
    queryFn: () => salesApi.getOrders({ from, to, limit: 200 }),
    staleTime: 3 * 60_000,
  });

  const orders = data?.data ?? [];

  const filtered = useMemo(() => {
    let list = orders;
    // search by order number
    if (search.trim()) {
      const q = search.replace(/^#/, '').trim();
      list = list.filter((o) => String(o.orderNumber).includes(q));
    }
    // method filter — placeholder: Order type has no paymentMethod field yet
    // When API adds it: list = list.filter(o => o.paymentMethod === method)
    return list;
  }, [orders, search]);

  // Summary stats
  const totalCompleted = useMemo(
    () => filtered.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.total, 0),
    [filtered],
  );
  const completedCount = filtered.filter((o) => o.status === 'COMPLETED').length;

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>To'lovlar tarixi</Text>
          <Text style={styles.headerSub}>{filtered.length} ta yozuv</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="card-outline" size={20} color={C.primary} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buyurtma raqami..."
        />
      </View>

      {/* Period pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsRow}
      >
        {PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Method filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsRow}
      >
        {METHODS.map((m) => {
          const active = m.key === method;
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodPill, active && styles.methodPillActive]}
              onPress={() => setMethod(m.key)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={m.icon}
                size={14}
                color={active ? C.white : C.muted}
              />
              <Text style={[styles.methodPillText, active && styles.methodPillTextActive]}>
                {m.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary strip */}
      {!isLoading && filtered.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Jami tushum</Text>
            <Text style={styles.summaryValue}>{fmt(totalCompleted)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Bajarildi</Text>
            <Text style={[styles.summaryValue, { color: C.green }]}>{completedCount} ta</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Jami</Text>
            <Text style={styles.summaryValue}>{filtered.length} ta</Text>
          </View>
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => (
            <PaymentCard
              orderNumber={item.orderNumber}
              status={item.status}
              total={item.total}
              createdAt={item.createdAt}
              customerId={item.customerId}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="card-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {search ? 'Topilmadi' : "To'lovlar yo'q"}
              </Text>
              <Text style={styles.emptySub}>Boshqa davr yoki filtr tanlang</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  searchWrap: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },

  pillsScroll: { flexGrow: 0, backgroundColor: C.white },
  pillsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  methodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  methodPillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  methodPillText: { fontSize: 12, fontWeight: '600', color: C.muted },
  methodPillTextActive: { color: C.white },

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 2 },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, gap: 12,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardOrderNum: {
    fontSize: 14, fontWeight: '800', color: C.primary,
    fontFamily: MONO,
  },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: C.muted },
  cardAmount: { fontSize: 14, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptySub: { fontSize: 12, color: C.muted },
});
