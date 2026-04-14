import React, { useState, useMemo } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { salesApi, type ShiftDetail } from '../../api/sales.api';

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

// ─── Period filter ─────────────────────────────────────
type PeriodKey = 'today' | '7d' | '30d' | 'all';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun'  },
  { key: '7d',    label: '7 kun'  },
  { key: '30d',   label: '30 kun' },
  { key: 'all',   label: 'Barchasi' },
];

function periodStart(key: PeriodKey): Date | null {
  const now = new Date();
  switch (key) {
    case 'today': { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    case '7d':    { const d = new Date(now); d.setDate(now.getDate() - 6); d.setHours(0,0,0,0); return d; }
    case '30d':   { const d = new Date(now); d.setDate(now.getDate() - 29); d.setHours(0,0,0,0); return d; }
    default:      return null;
  }
}

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number | undefined): string {
  if (!n) return '—';
  return n.toLocaleString('ru-RU') + ' UZS';
}

function fmtShort(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function duration(openedAt: Date | string, closedAt: Date | string | null): string {
  if (!closedAt) return 'Ochiq';
  const open  = typeof openedAt  === 'string' ? new Date(openedAt)  : openedAt;
  const close = typeof closedAt  === 'string' ? new Date(closedAt)  : closedAt;
  const mins  = Math.round((close.getTime() - open.getTime()) / 60_000);
  const h     = Math.floor(mins / 60);
  const m     = mins % 60;
  return h > 0 ? `${h}s ${m}d` : `${m}d`;
}

function cashierName(shift: ShiftDetail): string {
  if (shift.user) return `${shift.user.firstName} ${shift.user.lastName}`;
  return 'Kassir';
}

// ─── ShiftCard ─────────────────────────────────────────
function ShiftCard({ shift, index }: { shift: ShiftDetail; index: number }) {
  const isOpen   = shift.status === 'OPEN';
  const dur      = duration(shift.openedAt, shift.closedAt);
  const cashier  = cashierName(shift);

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.shiftNumBox, isOpen ? styles.shiftNumOpen : styles.shiftNumClosed]}>
            <Text style={[styles.shiftNum, { color: isOpen ? C.green : C.muted }]}>
              #{index + 1}
            </Text>
          </View>
          <View>
            <Text style={styles.cardDate}>{formatDate(shift.openedAt)}</Text>
            <Text style={styles.cardTime}>
              {formatTime(shift.openedAt)}
              {shift.closedAt ? ` — ${formatTime(shift.closedAt)}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
            <Text style={[styles.statusText, { color: isOpen ? C.green : C.muted }]}>
              {isOpen ? 'Ochiq' : 'Yopildi'}
            </Text>
          </View>
          <Text style={styles.durText}>{dur}</Text>
        </View>
      </View>

      {/* Cashier */}
      <View style={styles.cashierRow}>
        <Ionicons name="person-outline" size={13} color={C.muted} />
        <Text style={styles.cashierName}>{cashier}</Text>
      </View>

      <View style={styles.divider} />

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCell label="Buyurtmalar" value={shift.totalOrders ? `${shift.totalOrders} ta` : '—'} />
        <StatCell label="Naqd" value={fmtShort(shift.cashAmount)} color={C.green} />
        <StatCell label="Karta" value={fmtShort(shift.cardAmount)} color={C.primary} />
        <StatCell label="Nasiya" value={fmtShort(shift.nasiyaAmount)} color={C.orange} />
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Jami tushum</Text>
        <Text style={styles.totalValue}>{fmt(shift.totalRevenue)}</Text>
      </View>
    </View>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

// ─── ShiftReportsScreen ────────────────────────────────
interface Props {
  onClose?: () => void;
}

export default function ShiftReportsScreen({ onClose }: Props) {
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: () => salesApi.getShifts(1, 100),
    staleTime: 3 * 60_000,
  });

  const allShifts = data?.items ?? [];

  const filtered = useMemo(() => {
    const cutoff = periodStart(period);
    if (!cutoff) return allShifts;
    return allShifts.filter((s) => {
      const opened = typeof s.openedAt === 'string' ? new Date(s.openedAt) : s.openedAt;
      return opened >= cutoff;
    });
  }, [allShifts, period]);

  // Summary
  const totalRevenue = filtered.reduce((s, x) => s + (x.totalRevenue ?? 0), 0);
  const totalOrders  = filtered.reduce((s, x) => s + (x.totalOrders  ?? 0), 0);
  const closedCount  = filtered.filter((s) => s.status === 'CLOSED').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {onClose ? (
          <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
        ) : <View style={styles.headerBtn} />}
        <Text style={styles.headerTitle}>Smena hisobotlari</Text>
        <View style={{ width: 36 }} />
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

      {/* Summary strip */}
      {!isLoading && filtered.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Jami tushum</Text>
            <Text style={styles.summaryValue}>{fmtShort(totalRevenue)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Buyurtmalar</Text>
            <Text style={styles.summaryValue}>{totalOrders} ta</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Smenalar</Text>
            <Text style={styles.summaryValue}>{closedCount}/{filtered.length}</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <ShiftCard shift={item} index={index} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {period !== 'all' ? 'Bu davrda smenalar yo\'q' : 'Smenalar yo\'q'}
              </Text>
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },

  pillsScroll: { flexGrow: 0, backgroundColor: C.white },
  pillsRow: {
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 15, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 12 },

  card: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 8,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftNumBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  shiftNumOpen:   { backgroundColor: '#F0FDF4' },
  shiftNumClosed: { backgroundColor: C.bg },
  shiftNum: { fontSize: 13, fontWeight: '800' },
  cardDate: { fontSize: 14, fontWeight: '700', color: C.text },
  cardTime: { fontSize: 12, color: C.muted, marginTop: 1 },

  cardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  statusOpen:   { backgroundColor: '#F0FDF4' },
  statusClosed: { backgroundColor: C.bg },
  statusText: { fontSize: 11, fontWeight: '700' },
  durText: { fontSize: 12, color: C.muted },

  cashierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10,
  },
  cashierName: { fontSize: 13, color: C.muted, fontWeight: '500' },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },

  statsGrid: { flexDirection: 'row' },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '600', marginBottom: 3 },
  statValue: { fontSize: 13, fontWeight: '700', color: C.text },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  totalValue: { fontSize: 16, fontWeight: '800', color: C.primary },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
