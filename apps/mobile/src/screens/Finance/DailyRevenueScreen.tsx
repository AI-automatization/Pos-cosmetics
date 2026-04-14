import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
};

// ─── Period config ─────────────────────────────────────
type PeriodKey = '7d' | '30d' | '90d';

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d',  label: '7 kun',  days: 6  },
  { key: '30d', label: '30 kun', days: 29 },
  { key: '90d', label: '90 kun', days: 89 },
];

function getPeriodDates(days: number): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  return { from: from.toISOString().split('T')[0], to };
}

// ─── Helpers ───────────────────────────────────────────
function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

// ─── BarChart ──────────────────────────────────────────
const CHART_HEIGHT = 180;
const SCREEN_W = Dimensions.get('window').width;

function BarChart({ data }: { data: { date: string; revenue: number; orderCount: number }[] }) {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);

  // Limit bars visible — show last N fitting the screen
  const BAR_W = 28;
  const BAR_GAP = 6;
  const maxBars = Math.floor((SCREEN_W - 64) / (BAR_W + BAR_GAP));
  const visible = data.slice(-maxBars);

  if (visible.length === 0) return null;

  return (
    <View style={chartStyles.wrap}>
      {/* Y-axis labels */}
      <View style={chartStyles.yAxis}>
        {[1, 0.75, 0.5, 0.25, 0].map((pct) => (
          <Text key={pct} style={chartStyles.yLabel}>
            {fmtShort(maxRev * pct)}
          </Text>
        ))}
      </View>

      {/* Bars */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={chartStyles.barsRow}
      >
        {visible.map((item) => {
          const heightPct = item.revenue / maxRev;
          const barH = Math.max(4, Math.round(CHART_HEIGHT * heightPct));
          return (
            <View key={item.date} style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <View
                  style={[
                    chartStyles.bar,
                    { height: barH },
                  ]}
                />
              </View>
              <Text style={chartStyles.barLabel}>{dayLabel(item.date)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingRight: 8 },
  yAxis: {
    width: 48, justifyContent: 'space-between',
    paddingBottom: 22, paddingTop: 0,
  },
  yLabel: { fontSize: 10, color: '#9CA3AF', textAlign: 'right' },
  barsRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 6, paddingHorizontal: 4,
    height: CHART_HEIGHT + 22,
  },
  barCol: { alignItems: 'center', gap: 4 },
  barTrack: {
    width: 28, height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 28, borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  barLabel: { fontSize: 10, color: '#9CA3AF', width: 28, textAlign: 'center' },
});

// ─── DailyRevenueScreen ────────────────────────────────
interface Props {
  onClose?: () => void;
}

export default function DailyRevenueScreen({ onClose }: Props) {
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const days = PERIODS.find((p) => p.key === period)!.days;
  const { from, to } = useMemo(() => getPeriodDates(days), [days]);

  const { data: daily = [], isLoading } = useQuery({
    queryKey: ['daily-revenue', from, to],
    queryFn: () => reportsApi.getDailyRevenue(from, to),
    staleTime: 5 * 60_000,
  });

  // Summary stats
  const totalRevenue = useMemo(() => daily.reduce((s, d) => s + d.revenue, 0), [daily]);
  const totalOrders  = useMemo(() => daily.reduce((s, d) => s + d.orderCount, 0), [daily]);
  const avgPerDay    = daily.length > 0 ? totalRevenue / daily.length : 0;

  // Sort by date
  const sorted = useMemo(
    () => [...daily].sort((a, b) => a.date.localeCompare(b.date)),
    [daily],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {onClose ? (
          <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
        ) : <View style={styles.headerBtn} />}
        <Text style={styles.headerTitle}>Kunlik savdo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Period pills */}
        <View style={styles.pillsRow}>
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
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
        ) : (
          <>
            {/* Summary row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Jami tushum</Text>
                <Text style={styles.summaryValue}>{fmtShort(totalRevenue)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Buyurtmalar</Text>
                <Text style={styles.summaryValue}>{totalOrders.toLocaleString('ru-RU')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>O'rtacha/kun</Text>
                <Text style={styles.summaryValue}>{fmtShort(avgPerDay)}</Text>
              </View>
            </View>

            {/* Bar chart */}
            {sorted.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>KUNLIK GRAFIK</Text>
                <View style={styles.chartCard}>
                  <BarChart data={sorted} />
                </View>

                {/* Data table */}
                <Text style={styles.sectionLabel}>BATAFSIL JADVAL</Text>
                <View style={styles.tableCard}>
                  {/* Table header */}
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Sana</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { flex: 3, textAlign: 'right' }]}>Tushum</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2, textAlign: 'right' }]}>Buyurtma</Text>
                  </View>
                  {sorted.slice().reverse().map((item, idx) => (
                    <View key={item.date}>
                      {idx > 0 && <View style={styles.rowDivider} />}
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 2 }]}>{dayLabel(item.date)}</Text>
                        <Text style={[styles.tableCell, styles.tableCellRevenue, { flex: 3, textAlign: 'right' }]}>
                          {fmt(item.revenue)}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 2, textAlign: 'right', color: C.muted }]}>
                          {item.orderCount} ta
                        </Text>
                      </View>
                    </View>
                  ))}
                  {/* Total row */}
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalCell, { flex: 2 }]}>Jami</Text>
                    <Text style={[styles.totalCell, { flex: 3, textAlign: 'right', color: C.primary }]}>
                      {fmt(totalRevenue)}
                    </Text>
                    <Text style={[styles.totalCell, { flex: 2, textAlign: 'right' }]}>
                      {totalOrders} ta
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="bar-chart-outline" size={44} color={C.muted} />
                <Text style={styles.emptyText}>Bu davr uchun ma'lumot yo'q</Text>
              </View>
            )}
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
  loader: { marginTop: 40 },

  pillsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pill: {
    flex: 1, alignItems: 'center',
    paddingVertical: 8,
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
    paddingVertical: 14, paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 3 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },

  chartCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, overflow: 'hidden',
  },

  tableCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
  },
  tableHead: { backgroundColor: C.bg },
  tableHeadText: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
  },
  tableCell: { fontSize: 13, color: C.text },
  tableCellRevenue: { fontWeight: '700', color: C.text },
  rowDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },
  totalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#F0F9FF',
    borderTopWidth: 1.5, borderTopColor: C.primary + '40',
  },
  totalCell: { fontSize: 13, fontWeight: '800', color: C.text },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
