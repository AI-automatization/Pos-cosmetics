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
import { analyticsApi, type AbcGroup, type AbcProduct } from '../../api/analytics.api';

// ─── Constants ────────────────────────────────────────────
const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  secondary: '#6B7280', border: '#E5E7EB', primary: '#2563EB',
};

const GROUP_COLORS: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  A: { bg: '#DCFCE7', text: '#16A34A', bar: '#22C55E', label: 'Yuqori daromad' },
  B: { bg: '#FEF9C3', text: '#CA8A04', bar: '#F59E0B', label: "O'rta daromad" },
  C: { bg: '#F1F5F9', text: '#64748B', bar: '#94A3B8', label: 'Past daromad' },
};

type DayRange = 7 | 30 | 90;
const RANGES: { key: DayRange; label: string }[] = [
  { key: 7,  label: '7 kun' },
  { key: 30, label: '30 kun' },
  { key: 90, label: '90 kun' },
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

// ─── Group Card ───────────────────────────────────────────
function GroupCard({ group, expanded, onToggle }: {
  group: AbcGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const defaultColors = { bg: '#F1F5F9', text: '#64748B', bar: '#94A3B8', label: 'Past daromad' } as const;
  const colors = GROUP_COLORS[group.group] ?? defaultColors;
  return (
    <View style={s.groupCard}>
      <TouchableOpacity style={s.groupHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={[s.groupBadge, { backgroundColor: colors.bg }]}>
          <Text style={[s.groupLetter, { color: colors.text }]}>{group.group}</Text>
        </View>
        <View style={s.groupInfo}>
          <Text style={s.groupLabel}>{colors.label}</Text>
          <Text style={s.groupSub}>
            {group.products.length} mahsulot  •  {group.revenueShare.toFixed(0)}% ulush
          </Text>
        </View>
        <View style={s.groupRight}>
          <Text style={[s.groupRevenue, { color: colors.text }]}>{fmt(group.totalRevenue)}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={C.muted}
          />
        </View>
      </TouchableOpacity>

      {/* Revenue bar */}
      <View style={s.shareBarBg}>
        <View style={[s.shareBarFill, { width: `${Math.max(group.revenueShare, 1)}%`, backgroundColor: colors.bar }]} />
      </View>

      {/* Expanded product list */}
      {expanded && group.products.length > 0 && (
        <View style={s.productList}>
          {group.products.map((p, idx) => (
            <ProductRow key={p.productId} product={p} rank={idx + 1} barColor={colors.bar} maxRevenue={group.products[0]?.revenue ?? 1} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Product Row ──────────────────────────────────────────
function ProductRow({ product, rank, barColor, maxRevenue }: {
  product: AbcProduct; rank: number; barColor: string; maxRevenue: number;
}) {
  const pct = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
  return (
    <View style={s.productRow}>
      <Text style={s.productRank}>{rank}</Text>
      <View style={s.productMiddle}>
        <Text style={s.productName} numberOfLines={1}>{product.productName}</Text>
        <View style={s.productBarBg}>
          <View style={[s.productBarFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: barColor }]} />
        </View>
      </View>
      <View style={s.productRight}>
        <Text style={s.productRevenue}>{fmt(product.revenue)}</Text>
        <Text style={s.productPct}>{product.pct.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function AbcAnalysisScreen() {
  const navigation = useNavigation();
  const [days, setDays] = useState<DayRange>(30);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('A');

  const from = useMemo(() => daysAgoIso(days), [days]);
  const to = useMemo(() => todayIso(), []);

  const { data: groups = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['analytics-abc', days],
    queryFn: () => analyticsApi.getAbcAnalysis(from, to),
    staleTime: 60_000,
  });

  const grandTotal = useMemo(
    () => groups.reduce((s, g) => s + Number(g.totalRevenue), 0),
    [groups],
  );
  const totalProducts = useMemo(
    () => groups.reduce((s, g) => s + g.products.length, 0),
    [groups],
  );

  const toggleGroup = useCallback((g: string) => {
    setExpandedGroup((prev) => (prev === g ? null : g));
  }, []);

  const renderGroup = useCallback(({ item }: { item: AbcGroup }) => (
    <GroupCard
      group={item}
      expanded={expandedGroup === item.group}
      onToggle={() => toggleGroup(item.group)}
    />
  ), [expandedGroup, toggleGroup]);

  const keyExtractor = useCallback((item: AbcGroup) => item.group, []);

  const ListHeader = useMemo(() => (
    <View style={s.summaryRow}>
      <View style={s.summaryCard}>
        <Text style={s.summaryLabel}>Jami daromad</Text>
        <Text style={s.summaryValue}>{fmt(grandTotal)}</Text>
        <Text style={s.summarySub}>UZS</Text>
      </View>
      <View style={s.summaryCard}>
        <Text style={s.summaryLabel}>Mahsulotlar</Text>
        <Text style={s.summaryValue}>{totalProducts}</Text>
        <Text style={s.summarySub}>ta</Text>
      </View>
      <View style={s.summaryCard}>
        <Text style={s.summaryLabel}>Guruhlar</Text>
        <Text style={s.summaryValue}>A / B / C</Text>
        <Text style={s.summarySub}>3 ta</Text>
      </View>
    </View>
  ), [grandTotal, totalProducts]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ABC Tahlil</Text>
        <View style={s.backBtn} />
      </View>

      {/* Period selector */}
      <View style={s.periodRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[s.periodTab, days === r.key && s.periodTabActive]}
            onPress={() => setDays(r.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.periodText, days === r.key && s.periodTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={keyExtractor}
          renderItem={renderGroup}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => { void refetch(); }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="pie-chart-outline" size={48} color={C.muted} />
              <Text style={s.emptyText}>Ma'lumot yo'q</Text>
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

  // Group card
  groupCard: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  groupBadge: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  groupLetter: { fontSize: 18, fontWeight: '800' },
  groupInfo: { flex: 1 },
  groupLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  groupSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  groupRight: { alignItems: 'flex-end', gap: 2 },
  groupRevenue: { fontSize: 15, fontWeight: '800' },
  shareBarBg: { height: 4, backgroundColor: '#F3F4F6', marginHorizontal: 14, borderRadius: 2 },
  shareBarFill: { height: 4, borderRadius: 2 },

  // Product list
  productList: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, gap: 10 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productRank: { width: 18, fontSize: 12, fontWeight: '700', color: C.muted, textAlign: 'center' },
  productMiddle: { flex: 1, gap: 3 },
  productName: { fontSize: 13, fontWeight: '500', color: C.text },
  productBarBg: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  productBarFill: { height: 5, borderRadius: 3 },
  productRight: { alignItems: 'flex-end', minWidth: 70 },
  productRevenue: { fontSize: 12, fontWeight: '700', color: C.text },
  productPct: { fontSize: 10, color: C.muted, fontWeight: '600' },
});
