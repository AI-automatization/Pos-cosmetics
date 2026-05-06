// Ombor — InvoicesScreen: warehouse invoices list
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { InvoiceListItem } from '../../api/inventory.api';
import InvoiceDetailSheet from './InvoiceDetailSheet';
import { C } from './OmborColors';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

const STATUS_CFG = {
  PENDING:   { bg: '#FEF3C7', color: '#D97706', label: 'Kutilmoqda' },
  RECEIVED:  { bg: '#DCFCE7', color: '#16A34A', label: 'Qabul qilindi' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
} as const;

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
      ? (item.status as keyof typeof STATUS_CFG)
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['warehouse-invoices'],
    queryFn: () => inventoryApi.listInvoices(),
    staleTime: 60_000,
  });

  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;

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
          <Text style={styles.headerCount}>{total} ta</Text>
        )}
      </View>

      {/* List */}
      <FlatList
        data={invoices}
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
              <Text style={styles.emptyText}>Nakladnoylar yo'q</Text>
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
    // Android shadow
    elevation: 2,
    // iOS shadow
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
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },
});
