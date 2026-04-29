import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';
import ErrorView from '@/components/common/ErrorView';

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
type PeriodKey = 'today' | '7d' | '30d' | '90d' | '1y';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d',    label: '7 kun' },
  { key: '30d',   label: '30 kun' },
  { key: '90d',   label: '90 kun' },
  { key: '1y',    label: '1 yil' },
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
    case '1y':    from.setFullYear(now.getFullYear() - 1); break;
  }
  return { from: from.toISOString().split('T')[0]!, to };
}

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

// ─── KpiCard ───────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  color,
  iconName,
  iconBg,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={color} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── TableRow ──────────────────────────────────────────
function TableRow({
  label,
  value,
  color,
  bold,
  indent,
  divider,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  indent?: boolean;
  divider?: boolean;
}) {
  return (
    <>
      {divider && <View style={styles.tableDivider} />}
      <View style={[styles.tableRow, indent && styles.tableRowIndent]}>
        <Text style={[styles.tableLabel, bold && styles.tableLabelBold, indent && styles.tableLabelIndent]}>
          {label}
        </Text>
        <Text style={[styles.tableValue, bold && styles.tableValueBold, color ? { color } : null]}>
          {value}
        </Text>
      </View>
    </>
  );
}

// ─── SegmentBar ────────────────────────────────────────
function SegmentBar({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;
  return (
    <View style={styles.segBar}>
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (pct <= 0) return null;
        return (
          <View
            key={i}
            style={[
              styles.segSlice,
              { flex: pct, backgroundColor: seg.color },
              i === 0 && styles.segFirst,
              i === segments.length - 1 && styles.segLast,
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── PnLScreen ─────────────────────────────────────────
interface Props {
  onClose?: () => void;
}

export default function PnLScreen({ onClose }: Props) {
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-summary', from, to],
    queryFn: () => reportsApi.getSalesSummary(from, to),
    staleTime: 5 * 60_000,
  });

  // ── Derived P&L values ─────────────────────────────
  const grossRevenue = summary?.orders.grossRevenue ?? 0;
  const discount     = summary?.orders.totalDiscount ?? 0;
  const returnsAmt   = summary?.returns.total ?? 0;
  const netRevenue   = summary?.netRevenue ?? 0;

  // COGS not available from this endpoint — show 0 until API is ready
  const cogs         = 0;
  const grossProfit  = netRevenue - cogs;
  const grossMargin  = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0;

  // Segment bar: netRevenue = COGS + grossProfit
  const segments = [
    { value: cogs,        color: C.orange },
    { value: Math.max(0, grossProfit), color: C.green },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {onClose ? (
          <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
        ) : <View style={styles.headerBtn} />}
        <Text style={styles.headerTitle}>Foyda va Zarar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Period selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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

        {isLoading ? (
          <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
        ) : error ? (
          <ErrorView error={error} onRetry={() => void refetch()} />
        ) : !summary ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ma'lumot yo'q</Text>
          </View>
        ) : (
          <>
            {/* KPI cards 2×2 */}
            <Text style={styles.sectionLabel}>ASOSIY KO'RSATKICHLAR</Text>
            <View style={styles.kpiGrid}>
              <KpiCard
                label="Tushum"
                value={fmtShort(netRevenue)}
                color={C.primary}
                iconName="cash-outline"
                iconBg="#EFF6FF"
              />
              <KpiCard
                label="Yalpi foyda"
                value={fmtShort(grossProfit)}
                sub={grossMargin !== 0 ? `${grossMargin}% marja` : undefined}
                color={C.green}
                iconName="trending-up-outline"
                iconBg="#F0FDF4"
              />
              <KpiCard
                label="Tannarx"
                value={fmtShort(cogs)}
                color={C.orange}
                iconName="cube-outline"
                iconBg="#FFFBEB"
              />
              <KpiCard
                label="Sof daromad"
                value={fmtShort(grossProfit)}
                sub={grossMargin !== 0 ? `${grossMargin}%` : undefined}
                color={grossProfit >= 0 ? C.green : C.red}
                iconName="wallet-outline"
                iconBg={grossProfit >= 0 ? '#F0FDF4' : '#FEF2F2'}
              />
            </View>

            {/* P&L breakdown table */}
            <Text style={styles.sectionLabel}>P&L JADVALI</Text>
            <View style={styles.tableCard}>
              {/* Daromad */}
              <View style={styles.tableSectionHeader}>
                <Ionicons name="trending-up-outline" size={14} color={C.green} />
                <Text style={styles.tableSectionTitle}>DAROMAD</Text>
              </View>
              <TableRow label="Yalpi tushum"      value={fmt(grossRevenue)} />
              <TableRow label="− Chegirmalar"      value={`−${fmt(discount)}`}  indent color={C.orange} />
              <TableRow label="− Qaytarishlar"     value={`−${fmt(returnsAmt)}`} indent color={C.red} />
              <TableRow
                label="Sof tushum"
                value={fmt(netRevenue)}
                bold
                color={C.primary}
                divider
              />

              <View style={[styles.tableSectionHeader, { marginTop: 16 }]}>
                <Ionicons name="remove-circle-outline" size={14} color={C.orange} />
                <Text style={styles.tableSectionTitle}>XARAJATLAR</Text>
              </View>
              <TableRow label="Tannarx (COGS)"     value={fmt(cogs)} />
              <TableRow label="Operatsion xarajat" value={fmt(0)} indent color={C.muted} />
              <TableRow
                label="Jami xarajat"
                value={fmt(cogs)}
                bold
                color={C.orange}
                divider
              />

              <View style={styles.netRow}>
                <Text style={styles.netLabel}>SOF DAROMAD</Text>
                <Text style={[styles.netValue, { color: grossProfit >= 0 ? C.green : C.red }]}>
                  {grossProfit >= 0 ? '' : '−'}{fmt(Math.abs(grossProfit))}
                </Text>
              </View>
            </View>

            {/* Segment bar + legend */}
            <Text style={styles.sectionLabel}>TARKIB</Text>
            <View style={styles.segCard}>
              <SegmentBar segments={segments} />
              <View style={styles.legend}>
                {[
                  { color: C.green,  label: 'Yalpi foyda', value: grossProfit },
                  { color: C.orange, label: 'Tannarx',     value: cogs },
                ].map((item) => (
                  <View key={item.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                    <Text style={[styles.legendValue, { color: item.color }]}>
                      {fmtShort(item.value)}
                    </Text>
                  </View>
                ))}
              </View>

              {netRevenue === 0 && (
                <View style={styles.noDataRow}>
                  <Ionicons name="information-circle-outline" size={16} color={C.muted} />
                  <Text style={styles.noDataText}>Ma'lumot topilmadi yoki COGS API ulash kerak</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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

  content: { paddingBottom: 40 },

  pillsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  loader: { marginTop: 40 },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60,
  },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },

  // KPI
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 8,
  },
  kpiCard: {
    width: '47%', flexGrow: 1,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  kpiIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: '800' },
  kpiSub: { fontSize: 11, color: C.muted, marginTop: 3 },

  // Table
  tableCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  tableSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
  },
  tableSectionTitle: {
    fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableRowIndent: { paddingLeft: 12 },
  tableLabel: { fontSize: 14, color: C.text, flex: 1 },
  tableLabelBold: { fontWeight: '700' },
  tableLabelIndent: { color: C.muted, fontSize: 13 },
  tableValue: { fontSize: 14, color: C.text, fontWeight: '500' },
  tableValueBold: { fontWeight: '800', fontSize: 15 },
  tableDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },

  netRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 2, borderTopColor: C.border,
  },
  netLabel: { fontSize: 13, fontWeight: '800', color: C.text, letterSpacing: 0.5 },
  netValue: { fontSize: 18, fontWeight: '800' },

  // Segment bar
  segCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 16,
  },
  segBar: {
    flexDirection: 'row', height: 12, borderRadius: 6,
    overflow: 'hidden', backgroundColor: C.border, marginBottom: 16,
  },
  segSlice: { height: '100%' },
  segFirst: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  segLast: { borderTopRightRadius: 6, borderBottomRightRadius: 6 },

  legend: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, color: C.text, fontWeight: '500' },
  legendValue: { fontSize: 13, fontWeight: '700' },

  noDataRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border,
  },
  noDataText: { fontSize: 12, color: C.muted, flex: 1 },
});
