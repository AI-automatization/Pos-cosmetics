import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type DeadStockItem } from '../../api/analytics.api';

// ─── Constants ────────────────────────────────────────────
const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  border: '#E5E7EB', primary: '#2563EB', red: '#DC2626',
  amber: '#D97706', amberBg: '#FEF9C3',
};

type DaysThreshold = 30 | 90 | 180;
const THRESHOLDS: { key: DaysThreshold; label: string }[] = [
  { key: 30,  label: '30+ kun' },
  { key: 90,  label: '90+ kun' },
  { key: 180, label: '180+ kun' },
];

type SortKey = 'carryingCost' | 'daysIdle' | 'totalStock';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'carryingCost', label: 'Zarar' },
  { key: 'daysIdle',     label: 'Kunlar' },
  { key: 'totalStock',   label: 'Zaxira' },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru-RU');
}

function idleColor(days: number): { bg: string; text: string } {
  if (days >= 180) return { bg: '#FEE2E2', text: C.red };
  if (days >= 90) return { bg: C.amberBg, text: C.amber };
  return { bg: '#F3F4F6', text: C.muted };
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Hech qachon';
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Product Card ─────────────────────────────────────────
function DeadStockCard({ item, rank }: { item: DeadStockItem; rank: number }) {
  const ic = idleColor(item.daysIdle);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardRank}>{rank}</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardName} numberOfLines={1}>{item.productName}</Text>
          {item.sku && <Text style={s.cardSku}>{item.sku}</Text>}
        </View>
        <View style={[s.idleBadge, { backgroundColor: ic.bg }]}>
          <Text style={[s.idleText, { color: ic.text }]}>{item.daysIdle} kun</Text>
        </View>
      </View>

      <View style={s.detailRow}>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>Zaxira</Text>
          <Text style={s.detailValue}>{item.totalStock.toFixed(0)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>Oxirgi sotuv</Text>
          <Text style={s.detailValue}>{formatDate(item.lastSoldAt)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>Zarar</Text>
          <Text style={[s.detailValue, { color: C.red }]}>{fmt(item.carryingCost)}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function DeadStockScreen() {
  const navigation = useNavigation();
  const [threshold, setThreshold] = useState<DaysThreshold>(90);
  const [sortBy, setSortBy] = useState<SortKey>('carryingCost');
  const [search, setSearch] = useState('');

  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['analytics-dead-stock', threshold],
    queryFn: () => analyticsApi.getDeadStock(threshold),
    staleTime: 300_000,
  });

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.productName.toLowerCase().includes(q) ||
        (i.sku ?? '').toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [items, search, sortBy]);

  const totalCarryingCost = useMemo(
    () => items.reduce((s, i) => s + i.carryingCost, 0),
    [items],
  );

  const totalStock = useMemo(
    () => items.reduce((s, i) => s + i.totalStock, 0),
    [items],
  );

  const renderItem = useCallback(({ item, index }: { item: DeadStockItem; index: number }) => (
    <DeadStockCard item={item} rank={index + 1} />
  ), []);

  const keyExtractor = useCallback((item: DeadStockItem) => item.productId, []);

  const ListHeader = useMemo(() => (
    <>
      {/* Alert card */}
      {items.length > 0 && (
        <View style={s.alertCard}>
          <Ionicons name="warning" size={20} color={C.amber} />
          <View style={s.alertInfo}>
            <Text style={s.alertTitle}>{items.length} ta mahsulot {threshold}+ kun sotilmagan</Text>
            <Text style={s.alertSub}>Umumiy zarar: {fmt(totalCarryingCost)} UZS</Text>
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Mahsulotlar</Text>
          <Text style={s.summaryValue}>{items.length}</Text>
          <Text style={s.summarySub}>ta</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Jami zaxira</Text>
          <Text style={s.summaryValue}>{totalStock.toFixed(0)}</Text>
          <Text style={s.summarySub}>dona</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Jami zarar</Text>
          <Text style={[s.summaryValue, { color: C.red }]}>{fmt(totalCarryingCost)}</Text>
          <Text style={s.summarySub}>UZS</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Mahsulot qidirish..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Saralash:</Text>
        {SORT_OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[s.sortTab, sortBy === o.key && s.sortTabActive]}
            onPress={() => setSortBy(o.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.sortText, sortBy === o.key && s.sortTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  ), [items.length, threshold, totalCarryingCost, totalStock, search, sortBy]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Harakatsiz Tovarlar</Text>
        <View style={s.backBtn} />
      </View>

      {/* Threshold selector */}
      <View style={s.periodRow}>
        {THRESHOLDS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[s.periodTab, threshold === t.key && s.periodTabActive]}
            onPress={() => setThreshold(t.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.periodText, threshold === t.key && s.periodTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => { void refetch(); }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              <Text style={s.emptyTextGreen}>Barcha tovarlar faol!</Text>
              <Text style={s.emptyTextSub}>{threshold}+ kun sotilmagan mahsulot yo'q</Text>
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
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTextGreen: { fontSize: 16, color: '#16A34A', fontWeight: '700' },
  emptyTextSub: { fontSize: 13, color: C.muted },

  // Alert
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginTop: 16, padding: 14,
    backgroundColor: C.amberBg, borderRadius: 14,
  },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  alertSub: { fontSize: 12, color: C.amber, marginTop: 2 },

  // Summary
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 4 },
  summarySub: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },

  // Sort
  sortRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 8, gap: 8,
  },
  sortLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginRight: 4 },
  sortTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3F4F6' },
  sortTabActive: { backgroundColor: C.primary },
  sortText: { fontSize: 12, fontWeight: '600', color: C.muted },
  sortTextActive: { color: C.white },

  // Card
  card: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardRank: { width: 22, fontSize: 13, fontWeight: '800', color: C.muted, textAlign: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', color: C.text },
  cardSku: { fontSize: 11, color: C.muted, marginTop: 1, fontFamily: 'monospace' },
  idleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  idleText: { fontSize: 12, fontWeight: '800' },

  detailRow: { flexDirection: 'row', gap: 4 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  detailValue: { fontSize: 12, fontWeight: '700', color: C.text, marginTop: 2 },
});
