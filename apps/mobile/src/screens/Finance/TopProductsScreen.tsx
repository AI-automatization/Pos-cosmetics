import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
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
  orange:  '#D97706',
};

// Rank badge colors
const RANK_COLORS = [
  { bg: '#FEF3C7', color: '#D97706' }, // #1 gold
  { bg: '#F1F5F9', color: '#64748B' }, // #2 silver
  { bg: '#FEF3C7', color: '#B45309' }, // #3 bronze
];

// ─── Period config ─────────────────────────────────────
type PeriodKey = '7d' | '30d' | '90d' | '1y';

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d',  label: '7 kun',  days: 6   },
  { key: '30d', label: '30 kun', days: 29  },
  { key: '90d', label: '90 kun', days: 89  },
  { key: '1y',  label: '1 yil',  days: 364 },
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

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── ProductRowItem ────────────────────────────────────
function ProductRowItem({
  rank,
  productName,
  totalQty,
  totalRevenue,
}: {
  rank: number;
  productName: string;
  totalQty: number;
  totalRevenue: number;
}) {
  const rankStyle = RANK_COLORS[rank - 1] ?? { bg: '#EFF6FF', color: C.primary };

  return (
    <View style={styles.listItem}>
      {/* Rank */}
      <View style={[styles.rankCircle, { backgroundColor: rankStyle.bg }]}>
        <Text style={[styles.rankText, { color: rankStyle.color }]}>#{rank}</Text>
      </View>

      {/* Initials avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(productName)}</Text>
      </View>

      {/* Name */}
      <View style={styles.itemBody}>
        <Text style={styles.itemName} numberOfLines={1}>{productName}</Text>
        <Text style={styles.itemQty}>{totalQty.toLocaleString('ru-RU')} dona sotildi</Text>
      </View>

      {/* Revenue */}
      <Text style={styles.itemRevenue}>{fmtShort(totalRevenue)}</Text>
    </View>
  );
}

// ─── HorizontalBarChart ────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const BAR_MAX_W = SCREEN_W - 32 - 120; // padding + label area

function HorizontalBarChart({
  data,
}: {
  data: { productName: string; totalRevenue: number; totalQty: number }[];
}) {
  const maxRev = Math.max(...data.map((d) => d.totalRevenue), 1);
  const top10 = data.slice(0, 10);

  return (
    <View style={styles.hChartWrap}>
      {top10.map((item, i) => {
        const barW = Math.max(4, Math.round(BAR_MAX_W * (item.totalRevenue / maxRev)));
        const rankStyle = RANK_COLORS[i] ?? { bg: '#EFF6FF', color: C.primary };
        return (
          <View key={item.productName} style={styles.hBarRow}>
            {/* Rank + name */}
            <View style={styles.hBarLabel}>
              <View style={[styles.hRankDot, { backgroundColor: rankStyle.bg }]}>
                <Text style={[styles.hRankText, { color: rankStyle.color }]}>{i + 1}</Text>
              </View>
              <Text style={styles.hBarName} numberOfLines={1}>{item.productName}</Text>
            </View>

            {/* Bar + value */}
            <View style={styles.hBarTrack}>
              <View style={[styles.hBar, { width: barW }]} />
              <Text style={styles.hBarValue}>{fmtShort(item.totalRevenue)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── TopProductsScreen ─────────────────────────────────
type ViewMode = 'list' | 'chart';

interface Props {
  onClose?: () => void;
}

export default function TopProductsScreen({ onClose }: Props) {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const days = PERIODS.find((p) => p.key === period)!.days;
  const { from, to } = useMemo(() => getPeriodDates(days), [days]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['top-products', from, to],
    queryFn: () => reportsApi.getTopProducts(from, to, 10),
    staleTime: 5 * 60_000,
  });

  const totalRevenue = useMemo(
    () => products.reduce((s, p) => s + p.totalRevenue, 0),
    [products],
  );
  const totalQty = useMemo(
    () => products.reduce((s, p) => s + p.totalQty, 0),
    [products],
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
        <Text style={styles.headerTitle}>Top mahsulotlar</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Controls: period + view toggle */}
      <View style={styles.controlsRow}>
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

        {/* View toggle */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={viewMode === 'list' ? C.white : C.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'chart' && styles.toggleBtnActive]}
            onPress={() => setViewMode('chart')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="bar-chart-outline"
              size={18}
              color={viewMode === 'chart' ? C.white : C.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <>
          {/* Summary strip */}
          {products.length > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Jami tushum</Text>
                <Text style={styles.summaryValue}>{fmtShort(totalRevenue)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Jami sotildi</Text>
                <Text style={styles.summaryValue}>{totalQty.toLocaleString('ru-RU')} dona</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Mahsulotlar</Text>
                <Text style={styles.summaryValue}>{products.length} ta</Text>
              </View>
            </View>
          )}

          {products.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="trending-up-outline" size={44} color={C.muted} />
              <Text style={styles.emptyText}>Bu davr uchun ma'lumot yo'q</Text>
            </View>
          ) : viewMode === 'list' ? (
            <FlatList
              data={products}
              keyExtractor={(p) => p.productId}
              renderItem={({ item, index }) => (
                <ProductRowItem
                  rank={index + 1}
                  productName={item.productName}
                  totalQty={item.totalQty}
                  totalRevenue={item.totalRevenue}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chartContent}
            >
              <Text style={styles.sectionLabel}>TOP 10 MAHSULOT (TUSHUM BO'YICHA)</Text>
              <View style={styles.chartCard}>
                <HorizontalBarChart data={products} />
              </View>

              {/* Legend: qty ranking */}
              <Text style={styles.sectionLabel}>SOTISH SONI BO'YICHA</Text>
              <View style={styles.chartCard}>
                {[...products]
                  .sort((a, b) => b.totalQty - a.totalQty)
                  .slice(0, 5)
                  .map((item, i) => (
                    <View key={item.productId}>
                      {i > 0 && <View style={styles.rowDivider} />}
                      <View style={styles.qtyRow}>
                        <Text style={styles.qtyRank}>{i + 1}</Text>
                        <Text style={styles.qtyName} numberOfLines={1}>{item.productName}</Text>
                        <Text style={styles.qtyVal}>{item.totalQty.toLocaleString('ru-RU')} dona</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </ScrollView>
          )}
        </>
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

  controlsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    paddingRight: 12,
  },
  pillsRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  toggleWrap: {
    flexDirection: 'row', gap: 4,
    backgroundColor: C.bg, borderRadius: 10,
    padding: 3, marginLeft: 4,
  },
  toggleBtn: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: C.primary },

  loader: { marginTop: 40 },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // List view
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 8 },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 12, gap: 10,
  },
  rankCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800' },
  avatar: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: C.primary },
  itemBody: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: C.text },
  itemQty: { fontSize: 12, color: C.muted, marginTop: 2 },
  itemRevenue: { fontSize: 14, fontWeight: '800', color: C.primary },

  // Chart view
  chartContent: { padding: 16, paddingBottom: 40, gap: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1,
  },
  chartCard: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  hChartWrap: { gap: 14 },
  hBarRow: { gap: 6 },
  hBarLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hRankDot: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  hRankText: { fontSize: 10, fontWeight: '800' },
  hBarName: { flex: 1, fontSize: 13, color: C.text, fontWeight: '600' },
  hBarTrack: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 28 },
  hBar: { height: 10, borderRadius: 5, backgroundColor: C.primary },
  hBarValue: { fontSize: 12, color: C.muted, fontWeight: '600' },

  rowDivider: { height: 1, backgroundColor: C.border, marginVertical: 2 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
  },
  qtyRank: {
    width: 22, fontSize: 13, fontWeight: '800',
    color: C.muted, textAlign: 'center',
  },
  qtyName: { flex: 1, fontSize: 14, color: C.text, fontWeight: '600' },
  qtyVal: { fontSize: 13, color: C.green, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
