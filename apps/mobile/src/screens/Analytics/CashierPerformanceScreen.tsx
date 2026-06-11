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
import { useTranslation } from 'react-i18next';
import { analyticsApi, type CashierPerfItem } from '../../api/analytics.api';

// ─── Constants ────────────────────────────────────────────
const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  border: '#E5E7EB', primary: '#2563EB', green: '#16A34A', red: '#DC2626',
  gold: '#F59E0B', silver: '#9CA3AF', bronze: '#B45309',
};

type DayRange = 7 | 30 | 90;
const RANGE_KEYS: DayRange[] = [7, 30, 90];
const RANGE_I18N: Record<DayRange, string> = { 7: 'analytics.days7', 30: 'analytics.days30', 90: 'analytics.days90' };

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

const MEDAL_COLORS = [C.gold, C.silver, C.bronze];

// ─── Cashier Card ─────────────────────────────────────────
function CashierCard({ item, rank, maxRevenue, t }: {
  item: CashierPerfItem; rank: number; maxRevenue: number;
  t: (key: string) => string;
}) {
  const barPct = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
  const medalColor = rank <= 3 ? MEDAL_COLORS[rank - 1] : undefined;

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        {/* Avatar */}
        <View style={[s.avatar, medalColor ? { borderColor: medalColor, borderWidth: 2 } : undefined]}>
          <Text style={s.avatarText}>{getInitials(item.name)}</Text>
          {medalColor && (
            <View style={[s.medalBadge, { backgroundColor: medalColor }]}>
              <Text style={s.medalText}>{rank}</Text>
            </View>
          )}
        </View>

        <View style={s.cardInfo}>
          <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={s.cardSub}>{item.ordersCount} {t('analytics.cashier.ordersSub')}  •  {item.shiftsCount} {t('analytics.cashier.shiftsSub')}</Text>
        </View>

        <View style={s.cardRight}>
          <Text style={s.cardRevenue}>{fmt(item.revenue)}</Text>
          <Text style={s.cardRevenueSub}>UZS</Text>
        </View>
      </View>

      {/* Revenue bar */}
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${Math.max(barPct, 2)}%`, backgroundColor: C.primary }]} />
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Ionicons name="cart-outline" size={14} color={C.muted} />
          <Text style={s.statValue}>{item.ordersCount}</Text>
          <Text style={s.statLabel}>{t('analytics.cashier.orders')}</Text>
        </View>
        <View style={s.statItem}>
          <Ionicons name="wallet-outline" size={14} color={C.muted} />
          <Text style={s.statValue}>{fmt(item.avgBasket)}</Text>
          <Text style={s.statLabel}>{t('analytics.cashier.avgBasket')}</Text>
        </View>
        <View style={s.statItem}>
          <Ionicons name="refresh-outline" size={14} color={item.returnsCount > 0 ? C.red : C.muted} />
          <Text style={[s.statValue, item.returnsCount > 0 && { color: C.red }]}>
            {item.returnsCount}
          </Text>
          <Text style={s.statLabel}>{t('analytics.cashier.returns')}</Text>
        </View>
        <View style={s.statItem}>
          <Ionicons name="time-outline" size={14} color={C.muted} />
          <Text style={s.statValue}>{item.shiftsCount}</Text>
          <Text style={s.statLabel}>{t('analytics.cashier.shifts')}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function CashierPerformanceScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [days, setDays] = useState<DayRange>(30);
  const [search, setSearch] = useState('');

  const from = useMemo(() => daysAgoIso(days), [days]);
  const to = useMemo(() => todayIso(), []);

  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['analytics-cashier-perf', days],
    queryFn: () => analyticsApi.getCashierPerformance(from, to),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const maxRevenue = useMemo(
    () => filtered.reduce((mx, i) => Math.max(mx, i.revenue), 0),
    [filtered],
  );

  const totalRevenue = useMemo(() => items.reduce((s, i) => s + i.revenue, 0), [items]);
  const totalOrders = useMemo(() => items.reduce((s, i) => s + i.ordersCount, 0), [items]);
  const avgBasket = useMemo(
    () => totalOrders > 0 ? totalRevenue / totalOrders : 0,
    [totalRevenue, totalOrders],
  );

  const renderItem = useCallback(({ item, index }: { item: CashierPerfItem; index: number }) => (
    <CashierCard item={item} rank={index + 1} maxRevenue={maxRevenue} t={t} />
  ), [maxRevenue, t]);

  const keyExtractor = useCallback((item: CashierPerfItem) => item.userId, []);

  const ListHeader = useMemo(() => (
    <>
      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>{t('analytics.cashier.cashiers')}</Text>
          <Text style={s.summaryValue}>{items.length}</Text>
          <Text style={s.summarySub}>ta</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>{t('analytics.totalRevenue')}</Text>
          <Text style={s.summaryValue}>{fmt(totalRevenue)}</Text>
          <Text style={s.summarySub}>UZS</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>{t('analytics.cashier.avgBasket')}</Text>
          <Text style={s.summaryValue}>{fmt(avgBasket)}</Text>
          <Text style={s.summarySub}>UZS</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            style={s.searchInput}
            placeholder={t('analytics.cashier.searchPlaceholder')}
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
    </>
  ), [items.length, totalRevenue, avgBasket, search, t]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('analytics.cashier.title')}</Text>
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
          data={filtered}
          extraData={`${maxRevenue}|${i18n.language}`}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => { void refetch(); }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={C.muted} />
              <Text style={s.emptyText}>{search ? t('analytics.cashier.noResults') : t('analytics.noData')}</Text>
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

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },

  // Card
  card: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: C.primary },
  medalBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.white,
  },
  medalText: { fontSize: 9, fontWeight: '800', color: C.white },

  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.text },
  cardSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardRevenue: { fontSize: 16, fontWeight: '800', color: C.primary },
  cardRevenueSub: { fontSize: 10, color: C.muted, marginTop: 1 },

  barBg: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 4 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: C.text },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '500' },
});
