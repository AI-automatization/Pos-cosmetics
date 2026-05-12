// Ombor — InvoicesScreen: warehouse invoices list with search + status filter
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { InvoiceListItem } from '../../api/inventory.api';
import InvoiceDetailSheet from './InvoiceDetailSheet';
import { C } from './OmborColors';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

type InvoiceStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

const STATUS_CFG: Record<InvoiceStatus, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: '#FEF3C7', color: '#D97706', label: 'Kutilmoqda' },
  RECEIVED:  { bg: '#DCFCE7', color: '#16A34A', label: 'Qabul qilindi' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
};

type StatusFilter = 'ALL' | InvoiceStatus;

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',       label: 'Barchasi' },
  { key: 'PENDING',   label: 'Kutilmoqda' },
  { key: 'RECEIVED',  label: 'Qabul qilingan' },
  { key: 'CANCELLED', label: 'Bekor qilingan' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── InvoiceCard ──────────────────────────────────────────────────────────────

interface InvoiceCardProps {
  readonly item: InvoiceListItem;
  readonly onPress: (id: string) => void;
}

const InvoiceCard = React.memo(function InvoiceCard({
  item,
  onPress,
}: InvoiceCardProps) {
  const statusKey =
    item.status in STATUS_CFG
      ? (item.status as InvoiceStatus)
      : 'PENDING';
  const cfg = STATUS_CFG[statusKey];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      {/* Row 1: invoice number + status badge */}
      <View style={styles.cardRowBetween}>
        <Text style={[styles.invoiceNumber, { fontFamily: MONO }]}>
          #{item.invoiceNumber ?? 'N/A'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>

      {/* Row 2: supplier + items count */}
      <View style={styles.cardRowGap}>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {item.supplier?.name ?? "Yetkazib beruvchi yo'q"}
        </Text>
        <Text style={styles.cardMeta}>{item.itemsCount} mahsulot</Text>
      </View>

      {/* Row 3: date + total */}
      <View style={styles.cardRowBetween}>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.cardTotal}>{fmt(item.totalCost)}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InvoicesScreen() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['warehouse-invoices'],
    queryFn: () => inventoryApi.listInvoices(),
    staleTime: 60_000,
  });

  const invoices = data?.invoices ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return invoices.filter((item) => {
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      // Search filter
      if (!q) return true;
      const invoiceNum = (item.invoiceNumber ?? '').toLowerCase();
      const supplierName = (item.supplier?.name ?? '').toLowerCase();
      return invoiceNum.includes(q) || supplierName.includes(q);
    });
  }, [invoices, statusFilter, search]);

  // Count per status for badges
  const counts = useMemo(() => {
    const c = { ALL: invoices.length, PENDING: 0, RECEIVED: 0, CANCELLED: 0 };
    for (const inv of invoices) {
      if (inv.status in c) c[inv.status as InvoiceStatus]++;
    }
    return c;
  }, [invoices]);

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nakladnoylar</Text>
        </View>
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => refetch()}
            activeOpacity={0.75}
          >
            <Text style={styles.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nakladnoylar</Text>
        {!isLoading && (
          <Text style={styles.headerCount}>{invoices.length} ta</Text>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Raqam yoki yetkazuvchi..."
            placeholderTextColor={C.muted}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = counts[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setStatusFilter(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Result count */}
      {(search.length > 0 || statusFilter !== 'ALL') && !isLoading && (
        <Text style={styles.resultCount}>{filtered.length} ta natija</Text>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InvoiceCard item={item} onPress={setSelectedInvoiceId} />
        )}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={C.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>
                {search || statusFilter !== 'ALL' ? 'Natija topilmadi' : "Nakladnoylar yo'q"}
              </Text>
            </View>
          )
        }
      />

      {/* Detail Sheet */}
      <InvoiceDetailSheet
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerCount: {
    fontSize: 14,
    color: C.muted,
  },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: C.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    padding: 0,
  },

  // Filter tabs
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: C.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  filterTabTextActive: {
    color: C.white,
  },
  filterBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.secondary,
  },
  filterBadgeTextActive: {
    color: C.white,
  },

  resultCount: {
    fontSize: 12,
    color: C.muted,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // List
  listContent: {
    padding: 16,
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  cardRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
    color: C.muted,
  },
  cardDate: {
    fontSize: 12,
    color: C.muted,
  },
  cardTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primary,
  },

  // States
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 80,
  },
  errorText: {
    fontSize: 15,
    color: C.muted,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },
});
