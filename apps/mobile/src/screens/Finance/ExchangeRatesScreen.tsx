import React, { useState } from 'react';
import {
  View,
  Text,
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
import { styles, C } from './ExchangeRatesScreen.styles';

// ─── Types ─────────────────────────────────────────────
type Nav = NativeStackNavigationProp<FinanceStackParamList, 'ExchangeRates'>;

// ─── Constants ─────────────────────────────────────────
const ELEVATED_ROLES: string[] = ['OWNER', 'ADMIN'];
const HISTORY_DAYS = 30;

// ─── Helpers ───────────────────────────────────────────
function fmtRate(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
}

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
          <View style={styles.spacer} />
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
