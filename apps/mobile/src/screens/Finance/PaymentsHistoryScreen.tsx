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
import OrderDetailSheet from './OrderDetailSheet';
import type { OrderStatus } from '@raos/types';
import { useScreenProtection } from '../../hooks/useScreenProtection';

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

/** Space-separated thousands formatter (Hermes-safe, no toLocaleString) */
function fmt(n: number): string {
  const abs = Math.abs(n);
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '-' : '') + formatted + ' UZS';
}

/**
 * Compact number formatter for stat cards (small space).
 * < 1 000        → "950"
 * < 1 000 000    → "42 500" (space-separated thousands)
 * < 1 000 000 000 → "42.5 mln"
 * >= 1 000 000 000 → "1.2 mlrd"
 */
function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    const rounded = Math.round(val * 10) / 10;
    return sign + rounded.toString().replace('.', ',') + ' mlrd';
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const rounded = Math.round(val * 10) / 10;
    return sign + rounded.toString().replace('.', ',') + ' mln';
  }
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + formatted;
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

// ─── OrderWithMethod type ──────────────────────────────
type OrderWithMethod = { paymentMethod?: string | null } & {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  total: number;
  createdAt: Date | string;
  customerId: string | null;
};

// ─── StatCard ──────────────────────────────────────────
function StatCard({
  label,
  sum,
  count,
  color,
  bg,
}: {
  readonly label: string;
  readonly sum: number;
  readonly count: number;
  readonly color: string;
  readonly bg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text
        style={[styles.statSum, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {fmtCompact(sum)} so'm
      </Text>
      <Text style={styles.statCount}>{count} ta</Text>
    </View>
  );
}

// ─── PaymentsHistoryScreen ─────────────────────────────
export default function PaymentsHistoryScreen() {
  useScreenProtection();
  const [period, setPeriod]         = useState<PeriodKey>('30d');
  const [method, setMethod]         = useState<MethodKey>('Barchasi');
  const [search, setSearch]         = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', from, to],
    queryFn: () => salesApi.getOrders({ from, to, limit: 500 }),
    staleTime: 3 * 60_000,
  });

  const orders = data?.data ?? [];

  const filtered = useMemo(() => {
    let list = orders;

    // Client-side date filter (backend T-423 hali from/to qo'llab-quvvatlamaydi)
    const fromMs = new Date(from + 'T00:00:00').getTime();
    const toMs = new Date(to + 'T23:59:59').getTime();
    list = list.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= fromMs && t <= toMs;
    });

    // search by order number
    if (search.trim()) {
      const q = search.replace(/^#/, '').trim();
      list = list.filter((o) => String(o.orderNumber).includes(q));
    }

    // method filter (client-side — paymentMethod mavjud bo'lsa ishlaydi)
    if (method !== 'Barchasi') {
      const methodMap: Record<string, string[]> = {
        Naqd:  ['NAQD', 'CASH'],
        Karta: ['KARTA', 'CARD', 'TERMINAL'],
        Nasiya: ['NASIYA', 'DEBT'],
        Click: ['CLICK'],
        Payme: ['PAYME'],
      };
      const allowed = methodMap[method] ?? [];
      list = list.filter((o) =>
        allowed.includes((o as OrderWithMethod).paymentMethod ?? ''),
      );
    }

    return list;
  }, [orders, search, method, from, to]);

  // Stat cards — payment method bo'yicha
  const statCards = useMemo(() => {
    const cash = filtered.filter((o) =>
      ['NAQD', 'CASH'].includes((o as OrderWithMethod).paymentMethod ?? ''),
    );
    const card = filtered.filter((o) =>
      ['KARTA', 'CARD', 'TERMINAL'].includes(
        (o as OrderWithMethod).paymentMethod ?? '',
      ),
    );
    const debt = filtered.filter((o) =>
      ['NASIYA', 'DEBT'].includes((o as OrderWithMethod).paymentMethod ?? ''),
    );
    return [
      {
        label: 'Naqd',
        sum: cash.reduce((s, o) => s + Number(o.total), 0),
        count: cash.length,
        color: '#16A34A',
        bg: '#F0FDF4',
      },
      {
        label: 'Karta',
        sum: card.reduce((s, o) => s + Number(o.total), 0),
        count: card.length,
        color: '#7C3AED',
        bg: '#F5F3FF',
      },
      {
        label: 'Nasiya',
        sum: debt.reduce((s, o) => s + Number(o.total), 0),
        count: debt.length,
        color: '#D97706',
        bg: '#FFFBEB',
      },
    ];
  }, [filtered]);

  // Summary stats
  const totalCompleted = useMemo(
    () => filtered.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.total), 0),
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
              style={[
                styles.methodPill,
                active && styles.methodPillActive,
              ]}
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

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedOrderId(item.id)}
            >
              <PaymentCard
                orderNumber={item.orderNumber}
                status={item.status}
                total={item.total}
                createdAt={item.createdAt}
                customerId={item.customerId}
              />
            </TouchableOpacity>
          )}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View>
              {/* Stat cards */}
              <View style={styles.statRow}>
                {statCards.map((c) => (
                  <StatCard key={c.label} {...c} />
                ))}
              </View>

              {/* Summary strip */}
              {filtered.length > 0 && (
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
            </View>
          }
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

      <OrderDetailSheet
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
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
    borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    paddingVertical: 10,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 2 },

  flatList: { flex: 1 },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
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

  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statSum: {
    fontSize: 14,
    fontWeight: '700',
  },
  statCount: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});
