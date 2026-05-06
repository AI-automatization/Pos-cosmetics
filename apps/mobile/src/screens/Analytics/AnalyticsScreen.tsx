import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type BranchRevenueItem } from '../../api/analytics.api';

const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  border: '#E5E7EB', primary: '#2563EB', green: '#16A34A', orange: '#D97706',
};

type Period = 'today' | 'week' | 'month' | 'year';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy' },
  { key: 'year',  label: 'Yil' },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru-RU');
}

function BranchCard({ item, maxRevenue, rank }: {
  item: BranchRevenueItem; maxRevenue: number; rank: number;
}) {
  const pct = maxRevenue > 0 ? item.revenue / maxRevenue : 0;
  const barColor = rank === 1 ? C.primary : rank === 2 ? C.green : C.orange;
  return (
    <View style={s.branchCard}>
      <View style={s.branchHeader}>
        <View style={s.rankBadge}><Text style={s.rankText}>{rank}</Text></View>
        <Text style={s.branchName} numberOfLines={1}>{item.branchName}</Text>
        <Text style={s.branchRevenue}>{fmt(item.revenue)} UZS</Text>
      </View>
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${Math.max(pct * 100, 2)}%` as any, backgroundColor: barColor }]} />
      </View>
      <View style={s.branchMeta}>
        <Text style={s.metaText}>{item.orders} buyurtma</Text>
        {item.stockValue > 0 && <Text style={s.metaText}>Zaxira: {fmt(item.stockValue)}</Text>}
      </View>
    </View>
  );
}

export default function AnalyticsScreen(): React.JSX.Element {
  const [period, setPeriod] = useState<Period>('month');

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['analytics-branches', period],
    queryFn: async () => {
      try {
        return await analyticsApi.getRevenueByBranch(period);
      } catch {
        return [] as BranchRevenueItem[];
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const maxRevenue  = data.reduce((mx, b) => Math.max(mx, b.revenue), 0);
  const totalRevenue = data.reduce((s, b) => s + b.revenue, 0);
  const totalOrders  = data.reduce((s, b) => s + b.orders,  0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Analitika</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => { void refetch(); }} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <View style={s.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[s.periodTab, period === p.key && s.periodTabActive]}
            onPress={() => setPeriod(p.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.periodText, period === p.key && s.periodTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={C.primary} />
      ) : isError ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={C.muted} />
          <Text style={s.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => { void refetch(); }}>
            <Text style={s.retryText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => { void refetch(); }} />}
        >
          <View style={s.summaryRow}>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Jami daromad</Text>
              <Text style={s.summaryValue}>{fmt(totalRevenue)}</Text>
              <Text style={s.summarySub}>UZS</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Buyurtmalar</Text>
              <Text style={s.summaryValue}>{totalOrders.toLocaleString()}</Text>
              <Text style={s.summarySub}>ta</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Filiallar</Text>
              <Text style={s.summaryValue}>{data.length}</Text>
              <Text style={s.summarySub}>ta</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Filiallar reytingi</Text>
            {data.length === 0 ? (
              <View style={s.center}>
                <Ionicons name="bar-chart-outline" size={44} color={C.muted} />
                <Text style={s.errorText}>Ma'lumot yo'q</Text>
              </View>
            ) : (
              [...data]
                .sort((a, b) => b.revenue - a.revenue)
                .map((item, idx) => (
                  <BranchCard key={item.branchId} item={item} maxRevenue={maxRevenue} rank={idx + 1} />
                ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  periodRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  periodTab: { flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  periodTabActive: { backgroundColor: C.primary },
  periodText: { fontSize: 13, fontWeight: '600', color: C.muted },
  periodTextActive: { color: C.white },
  loader: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 40 },
  errorText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: C.primary },
  retryText: { fontSize: 14, fontWeight: '700', color: C.white },
  scroll: { paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600', textAlign: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 4 },
  summarySub: { fontSize: 11, color: C.muted, marginTop: 2 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  branchCard: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10,
  },
  branchHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  rankBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800', color: C.primary },
  branchName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  branchRevenue: { fontSize: 14, fontWeight: '800', color: C.primary },
  barBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 8 },
  barFill: { height: 6, borderRadius: 3 },
  branchMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: C.muted, fontWeight: '500' },
});
