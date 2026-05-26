// Ombor — InvoicesScreen: warehouse invoices list with search + status filter
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import InvoiceDetailSheet from './InvoiceDetailSheet';
import InvoiceCard from './InvoiceCard';
import { C } from './OmborColors';
import { styles } from './InvoicesScreen.styles';

// ─── Constants ────────────────────────────────────────────────────────────────

type InvoiceStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';
type StatusFilter = 'ALL' | InvoiceStatus;

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',       label: 'Barchasi' },
  { key: 'PENDING',   label: 'Kutilmoqda' },
  { key: 'RECEIVED',  label: 'Qabul qilingan' },
  { key: 'CANCELLED', label: 'Bekor qilingan' },
];

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
        style={styles.filterScroll}
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
