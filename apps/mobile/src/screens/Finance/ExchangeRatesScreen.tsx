import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { exchangeApi } from '@/api';
import type { ExchangeRate, ExchangeRateHistory } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import ErrorView from '@/components/common/ErrorView';
import type { FinanceStackParamList } from '@/navigation/types';

// ─── Types ─────────────────────────────────────────────
type Nav = NativeStackNavigationProp<FinanceStackParamList, 'ExchangeRates'>;

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  teal:    '#0891B2',
  tealBg:  '#ECFEFF',
  tealBorder: '#A5F3FC',
  green:   '#16A34A',
};

// ─── Helpers ───────────────────────────────────────────
function fmtRate(n: number): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── Constants ─────────────────────────────────────────
const ELEVATED_ROLES: string[] = ['OWNER', 'ADMIN'];
const HISTORY_DAYS = 30;

// ─── HistoryRow ────────────────────────────────────────
interface HistoryRowProps {
  item: ExchangeRateHistory;
  isFirst: boolean;
}

const HistoryRow = React.memo(function HistoryRow({ item, isFirst }: HistoryRowProps) {
  return (
    <View>
      {!isFirst && <View style={styles.rowDivider} />}
      <View style={styles.historyRow}>
        <Text style={styles.historyDate}>{fmtDate(item.date)}</Text>
        <Text style={styles.historyRate}>1 USD = {fmtRate(item.usdUzs)} UZS</Text>
      </View>
    </View>
  );
});

// ─── ExchangeRatesScreen ───────────────────────────────
export default function ExchangeRatesScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const canSync = user !== null && ELEVATED_ROLES.includes(user.role);

  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Queries ─────────────────────────────────────────
  const {
    data: latest,
    isLoading: latestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useQuery<ExchangeRate>({
    queryKey: ['exchange-rate-latest'],
    queryFn: () => exchangeApi.getLatest(),
    staleTime: 5 * 60_000,
  });

  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<ExchangeRateHistory[]>({
    queryKey: ['exchange-rate-history', HISTORY_DAYS],
    queryFn: () => exchangeApi.getHistory(HISTORY_DAYS),
    staleTime: 5 * 60_000,
  });

  const isLoading = latestLoading || historyLoading;
  const error = latestError ?? historyError;

  // ─── Handlers ────────────────────────────────────────
  async function handleSync() {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await exchangeApi.sync();
      await queryClient.invalidateQueries({ queryKey: ['exchange-rate-latest'] });
      await queryClient.invalidateQueries({ queryKey: ['exchange-rate-history'] });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchLatest(), refetchHistory()]);
    setRefreshing(false);
  }

  // ─── Error state ─────────────────────────────────────
  if (error) {
    return <ErrorView error={error} onRetry={() => void handleRefresh()} />;
  }

  // ─── Sorted history (newest first) ───────────────────
  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

  // ─── Render ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Valyuta kurslari</Text>
        {canSync ? (
          <TouchableOpacity
            style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
            onPress={() => void handleSync()}
            disabled={isSyncing}
            activeOpacity={0.75}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Ionicons name="sync-outline" size={16} color={C.white} />
            )}
            <Text style={styles.syncBtnText}>{isSyncing ? 'Yangilanmoq...' : 'Yangilash'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <FlatList
        data={sortedHistory}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={C.teal}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Current rate card */}
            {isLoading && !latest ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={C.teal} />
              </View>
            ) : latest ? (
              <View style={styles.rateCard}>
                <View style={styles.rateCardTop}>
                  <Ionicons name="swap-horizontal-outline" size={22} color={C.teal} />
                  <Text style={styles.rateCardLabel}>Joriy kurs</Text>
                </View>
                <Text style={styles.rateValue}>
                  1 USD = {fmtRate(latest.usdUzs)}{' '}
                  <Text style={styles.rateCurrency}>UZS</Text>
                </Text>
                <View style={styles.rateCardMeta}>
                  <View style={styles.rateMetaItem}>
                    <Ionicons name="calendar-outline" size={13} color={C.muted} />
                    <Text style={styles.rateMetaText}>{fmtDate(latest.date)}</Text>
                  </View>
                  <View style={styles.rateMetaItem}>
                    <Ionicons name="globe-outline" size={13} color={C.muted} />
                    <Text style={styles.rateMetaText}>{latest.source}</Text>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Section label */}
            <Text style={styles.sectionLabel}>SO'NGGI {HISTORY_DAYS} KUNLIK TARIX</Text>

            {/* History card top */}
            {sortedHistory.length > 0 && (
              <View style={styles.tableHead}>
                <Text style={styles.tableHeadText}>Sana</Text>
                <Text style={[styles.tableHeadText, styles.tableHeadRight]}>Kurs</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="trending-up-outline" size={44} color={C.muted} />
              <Text style={styles.emptyText}>Tarix ma'lumotlari yo'q</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <HistoryRow item={item} isFirst={index === 0} />
        )}
        ListFooterComponent={sortedHistory.length > 0 ? <View style={styles.tableFooter} /> : null}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 36,
    justifyContent: 'center',
  },
  syncBtnDisabled: { opacity: 0.7 },
  syncBtnText: { fontSize: 12, fontWeight: '700', color: C.white },

  // Content
  content: { paddingBottom: 40 },
  loaderWrap: { marginTop: 40, alignItems: 'center' },

  // Rate card
  rateCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.tealBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.tealBorder,
    padding: 20,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  rateCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  rateCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateValue: {
    fontSize: 32,
    fontWeight: '800',
    color: C.teal,
    letterSpacing: -0.5,
  },
  rateCurrency: {
    fontSize: 20,
    fontWeight: '700',
    color: C.teal,
  },
  rateCardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  rateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateMetaText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },

  // Table
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeadText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableHeadRight: { textAlign: 'right' },

  // History rows
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: C.white,
    marginHorizontal: 16,
  },
  historyDate: {
    fontSize: 14,
    color: C.muted,
    fontWeight: '500',
  },
  historyRate: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  tableFooter: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
