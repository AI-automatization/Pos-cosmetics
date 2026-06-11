import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { analyticsApi, type MarginItem } from '../../api/analytics.api';

// ─── Constants ────────────────────────────────────────────
const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  secondary: '#6B7280', border: '#E5E7EB', primary: '#2563EB',
  green: '#16A34A', amber: '#CA8A04', red: '#DC2626',
};

type DayRange = 7 | 30 | 90;
const RANGE_KEYS: DayRange[] = [7, 30, 90];
const RANGE_I18N: Record<DayRange, string> = { 7: 'analytics.days7', 30: 'analytics.days30', 90: 'analytics.days90' };

type SortKey = 'marginPct' | 'grossProfit' | 'revenue';
const SORT_KEYS: { key: SortKey; i18n: string }[] = [
  { key: 'marginPct',   i18n: 'analytics.margin.sortMargin' },
  { key: 'grossProfit', i18n: 'analytics.margin.sortProfit' },
  { key: 'revenue',     i18n: 'analytics.margin.sortRevenue' },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru-RU');
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function marginColor(pct: number): { bg: string; text: string } {
  if (pct >= 30) return { bg: '#DCFCE7', text: C.green };
  if (pct >= 15) return { bg: '#FEF9C3', text: C.amber };
  return { bg: '#FEE2E2', text: C.red };
}

// ─── Product Row ──────────────────────────────────────────
function ProductRow({ item, rank, maxProfit, t }: {
  item: MarginItem; rank: number; maxProfit: number;
  t: (key: string) => string;
}) {
  const mc = marginColor(item.marginPct);
  const barPct = maxProfit > 0 ? (item.grossProfit / maxProfit) * 100 : 0;

  return (
    <View style={s.productCard}>
      <View style={s.productHeader}>
        <Text style={s.productRank}>{rank}</Text>
        <View style={s.productInfo}>
          <Text style={s.productName} numberOfLines={1}>{item.productName}</Text>
          {item.categoryName && (
            <Text style={s.productCategory} numberOfLines={1}>{item.categoryName}</Text>
          )}
        </View>
        <View style={[s.marginBadge, { backgroundColor: mc.bg }]}>
          <Text style={[s.marginText, { color: mc.text }]}>{item.marginPct.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Profit bar */}
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${Math.max(barPct, 2)}%`, backgroundColor: mc.text }]} />
      </View>

      {/* Details row */}
      <View style={s.detailRow}>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>{t('analytics.margin.revenue')}</Text>
          <Text style={s.detailValue}>{fmt(item.revenue)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>{t('analytics.margin.cost')}</Text>
          <Text style={s.detailValue}>{fmt(item.costTotal)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>{t('analytics.margin.profit')}</Text>
          <Text style={[s.detailValue, { color: item.grossProfit >= 0 ? C.green : C.red }]}>
            {fmt(item.grossProfit)}
          </Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>{t('analytics.margin.sold')}</Text>
          <Text style={s.detailValue}>{item.qtySold}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function MarginAnalysisScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [days, setDays] = useState<DayRange>(30);
  const [sortBy, setSortBy] = useState<SortKey>('marginPct');

  const from = useMemo(() => daysAgoIso(days), [days]);
  const to = useMemo(() => todayIso(), []);

  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['analytics-margin', days],
    queryFn: () => analyticsApi.getMarginAnalysis(from, to),
    staleTime: 60_000,
  });

  const sorted = useMemo(
    () => [...items].sort((a, b) => b[sortBy] - a[sortBy]),
    [items, sortBy],
  );

  const avgMargin = useMemo(() => {
    if (items.length === 0) return 0;
    return items.reduce((s, i) => s + i.marginPct, 0) / items.length;
  }, [items]);

  const totalProfit = useMemo(
    () => items.reduce((s, i) => s + i.grossProfit, 0),
    [items],
  );

  const totalRevenue = useMemo(
    () => items.reduce((s, i) => s + i.revenue, 0),
    [items],
  );

  const maxProfit = useMemo(
    () => sorted.length > 0 ? Math.max(...sorted.map((i) => Math.abs(i.grossProfit))) : 1,
    [sorted],
  );

  const renderItem = useCallback(({ item, index }: { item: MarginItem; index: number }) => (
    <ProductRow item={item} rank={index + 1} maxProfit={maxProfit} t={t} />
  ), [maxProfit, t]);

  const keyExtractor = useCallback((item: MarginItem) => item.productId, []);

  const avgMc = marginColor(avgMargin);

  const ListHeader = useMemo(() => (
    <>
      {/* Summary cards */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>{t('analytics.margin.avgMargin')}</Text>
          <Text style={[s.summaryValue, { color: avgMc.text }]}>{avgMargin.toFixed(1)}%</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>{t('analytics.margin.totalProfit')}</Text>
          <Text style={s.summaryValue}>{fmt(totalProfit)}</Text>
          <Text style={s.summarySub}>UZS</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>{t('analytics.totalRevenue')}</Text>
          <Text style={s.summaryValue}>{fmt(totalRevenue)}</Text>
          <Text style={s.summarySub}>UZS</Text>
        </View>
      </View>

      {/* Sort selector */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>{t('analytics.sortLabel')}</Text>
        {SORT_KEYS.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[s.sortTab, sortBy === o.key && s.sortTabActive]}
            onPress={() => setSortBy(o.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.sortText, sortBy === o.key && s.sortTextActive]}>{t(o.i18n)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  ), [avgMargin, avgMc.text, totalProfit, totalRevenue, sortBy, t]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('analytics.margin.title')}</Text>
        <View style={s.backBtn} />
      </View>

      {/* Period selector */}
      <View style={s.periodRow}>
        {RANGE_KEYS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[s.periodTab, days === r && s.periodTabActive]}
            onPress={() => setDays(r)}
            activeOpacity={0.75}
          >
            <Text style={[s.periodText, days === r && s.periodTextActive]}>{t(RANGE_I18N[r])}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={sorted}
          extraData={`${maxProfit}|${i18n.language}`}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => { void refetch(); }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="analytics-outline" size={48} color={C.muted} />
              <Text style={s.emptyText}>{t('analytics.noData')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },

  periodRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  periodTab: { flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  periodTabActive: { backgroundColor: C.primary },
  periodText: { fontSize: 13, fontWeight: '600', color: C.muted },
  periodTextActive: { color: C.white },

  loader: { flex: 1 },
  listContent: { paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },

  // Summary
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 4 },
  summarySub: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Sort
  sortRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 10, gap: 8,
  },
  sortLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginRight: 4 },
  sortTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3F4F6' },
  sortTabActive: { backgroundColor: C.primary },
  sortText: { fontSize: 12, fontWeight: '600', color: C.muted },
  sortTextActive: { color: C.white },

  // Product card
  productCard: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14,
  },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  productRank: { width: 22, fontSize: 13, fontWeight: '800', color: C.muted, textAlign: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: C.text },
  productCategory: { fontSize: 11, color: C.muted, marginTop: 1 },
  marginBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  marginText: { fontSize: 13, fontWeight: '800' },

  barBg: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },

  detailRow: { flexDirection: 'row', gap: 4 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  detailValue: { fontSize: 12, fontWeight: '700', color: C.text, marginTop: 2 },
});
