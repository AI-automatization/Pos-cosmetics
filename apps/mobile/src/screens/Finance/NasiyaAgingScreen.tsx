import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nasiyaApi, type DebtRecord } from '../../api/nasiya.api';
import ErrorView from '@/components/common/ErrorView';
import { useScreenProtection } from '../../hooks/useScreenProtection';
import QuickPaySheet from './QuickPaySheet';
import NasiyaDebtCard from './NasiyaDebtCard';

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

// ─── Helpers ───────────────────────────────────────────
function fmtShort(n: number): string {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + ' mln';
  if (num >= 1_000)     return (num / 1_000).toFixed(0) + ' ming';
  return num.toString();
}

// ─── NasiyaAgingScreen ─────────────────────────────────
type TabKey = 'all' | 'overdue';

interface Props {
  onClose?: () => void;
}

export default function NasiyaAgingScreen({ onClose }: Props) {
  useScreenProtection();
  const navigation              = useNavigation();
  const [tab, setTab]           = useState<TabKey>('all');
  const [payRecord, setPayRecord] = useState<DebtRecord | null>(null);
  const queryClient             = useQueryClient();

  const { data: allData, isLoading: allLoading, error, refetch } = useQuery({
    queryKey: ['nasiya-list'],
    queryFn: () => nasiyaApi.getList(),
    staleTime: 2 * 60_000,
  });

  const { data: overdueData, isLoading: overdueLoading } = useQuery({
    queryKey: ['nasiya-overdue'],
    queryFn: () => nasiyaApi.getOverdue(),
    staleTime: 2 * 60_000,
  });

  const allRecords     = allData?.items ?? [];
  const overdueRecords = overdueData ?? [];

  const displayed = tab === 'all' ? allRecords : overdueRecords;
  const isLoading  = tab === 'all' ? allLoading : overdueLoading;

  // Summary stats
  const totalDebt    = allRecords.reduce((s, r) => s + Number(r.remaining), 0);
  const overdueAmt   = overdueRecords.reduce((s, r) => s + Number(r.remaining), 0);
  const thisMonth    = useMemo(() => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!;
    return allRecords
      .filter((r) => r.dueDate && r.dueDate >= start)
      .reduce((s, r) => s + Number(r.remaining), 0);
  }, [allRecords]);

  const handlePaid = () => {
    void queryClient.invalidateQueries({ queryKey: ['nasiya-list'] });
    void queryClient.invalidateQueries({ queryKey: ['nasiya-overdue'] });
  };

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (onClose ? onClose() : navigation.goBack())}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nasiya qarzdorlik</Text>
        <View style={styles.spacer} />
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Jami qarz',       value: fmtShort(totalDebt),    color: C.text,   bg: C.white   },
          { label: "Muddati o'tgan",  value: fmtShort(overdueAmt),   color: C.red,    bg: '#FEF2F2' },
          { label: 'Bu oy',           value: fmtShort(thisMonth),    color: C.orange, bg: '#FFFBEB' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
            <Text style={styles.summaryLabel}>{s.label}</Text>
            <Text
              style={[styles.summaryValue, { color: s.color }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {s.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'overdue'] as TabKey[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? 'Barchasi' : "Muddati o'tgan"}
            </Text>
            {t === 'overdue' && overdueRecords.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{overdueRecords.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <NasiyaDebtCard record={item} onPay={setPayRecord} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={44} color={C.green} />
              <Text style={styles.emptyTitle}>
                {tab === 'overdue' ? "Muddati o'tgan nasiyalar yo'q" : "Nasiyalar yo'q"}
              </Text>
            </View>
          }
        />
      )}

      <QuickPaySheet
        record={payRecord}
        onClose={() => setPayRecord(null)}
        onPaid={handlePaid}
      />
    </SafeAreaView>
  );
}

// ─── Screen styles ──────────────────────────────────────
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
  spacer: { width: 36 },

  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '800' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 6,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.primary },
  tabBadge: {
    backgroundColor: C.red, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabBadgeText: { fontSize: 11, fontWeight: '800', color: C.white },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 12 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
