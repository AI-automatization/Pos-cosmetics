import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { LowStockItem } from '../../api/inventory.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F5F5F7',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  secondary: '#6B7280',
  border:  '#F3F4F6',
  primary: '#5B5BD6',
  green:   '#10B981',
  orange:  '#F59E0B',
  red:     '#EF4444',
};

// ─── Stock status helper ────────────────────────────────
type StockStatus = 'NORMAL' | 'LOW' | 'OUT';

function getStatus(item: LowStockItem): StockStatus {
  if (item.stock === 0) return 'OUT';
  if (item.stock <= item.minStockLevel) return 'LOW';
  return 'NORMAL';
}

const STATUS_CFG: Record<StockStatus, { bg: string; text: string; label: string }> = {
  NORMAL: { bg: '#D1FAE5', text: C.green,  label: 'Normal'  },
  LOW:    { bg: '#FEF3C7', text: C.orange, label: 'Kam'     },
  OUT:    { bg: '#FEE2E2', text: C.red,    label: 'Tugadi'  },
};

type FilterTab = 'ALL' | 'LOW' | 'OUT';
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'Hammasi' },
  { key: 'LOW', label: 'Kam'     },
  { key: 'OUT', label: 'Tugadi'  },
];

// ─── Stats chips ───────────────────────────────────────
const StatsChips = React.memo(function StatsChips({ items }: { items: LowStockItem[] }) {
  const total  = items.length;
  const low    = items.filter((i) => getStatus(i) === 'LOW').length;
  const out    = items.filter((i) => getStatus(i) === 'OUT').length;
  const normal = total - low - out;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      <View style={[styles.chip, { backgroundColor: C.primary + '15' }]}>
        <Text style={[styles.chipValue, { color: C.primary }]}>{total}</Text>
        <Text style={[styles.chipLabel, { color: C.primary }]}>Jami</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#D1FAE5' }]}>
        <Text style={[styles.chipValue, { color: C.green }]}>{normal}</Text>
        <Text style={[styles.chipLabel, { color: C.green }]}>Normal</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#FEF3C7' }]}>
        <Text style={[styles.chipValue, { color: C.orange }]}>{low}</Text>
        <Text style={[styles.chipLabel, { color: C.orange }]}>Kam</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#FEE2E2' }]}>
        <Text style={[styles.chipValue, { color: C.red }]}>{out}</Text>
        <Text style={[styles.chipLabel, { color: C.red }]}>Tugadi</Text>
      </View>
    </ScrollView>
  );
});

// ─── Stock item card ────────────────────────────────────
function StockCard({ item }: { item: LowStockItem }) {
  const status = getStatus(item);
  const cfg    = STATUS_CFG[status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={styles.cardIconWrap}>
            <MaterialCommunityIcons name="package-variant" size={18} color={C.primary} />
          </View>
          <Text style={styles.cardName} numberOfLines={2}>{item.productName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={12} color={C.muted} />
          <Text style={styles.cardWarehouse}>{item.warehouseName}</Text>
        </View>
        <Text style={[styles.cardStock, { color: status === 'OUT' ? C.red : status === 'LOW' ? C.orange : C.text }]}>
          {item.stock} / min {item.minStockLevel}
        </Text>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────
export default function OmborScreen() {
  const [search, setSearch]     = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ombor-stock'],
    queryFn: () => inventoryApi.getStockLevels(),
  });

  const allItems = data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(q) ||
        item.warehouseName.toLowerCase().includes(q);
      const status = getStatus(item);
      const matchTab =
        activeTab === 'ALL' ||
        (activeTab === 'LOW'  && status === 'LOW')  ||
        (activeTab === 'OUT'  && status === 'OUT');
      return matchSearch && matchTab;
    });
  }, [search, activeTab, allItems]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ombor</Text>
        </View>
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ombor</Text>
        </View>
        <View style={styles.centerFill}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.75}>
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
        <Text style={styles.headerTitle}>Ombor</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <StatsChips items={allItems} />

            {/* Search */}
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color={C.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Mahsulot yoki ombor nomi..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={16} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.resultCount}>{filtered.length} ta mahsulot</Text>
          </View>
        }
        renderItem={({ item }) => <StockCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.muted} />
            <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },

  content:    { paddingBottom: 32 },
  listHeader: { gap: 12, paddingBottom: 4 },

  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText:  { fontSize: 15, color: C.muted },
  retryBtn:   { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, backgroundColor: C.primary },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  chipsRow:   { paddingHorizontal: 16, gap: 10, paddingVertical: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center', minWidth: 72,
  },
  chipValue: { fontSize: 16, fontWeight: '800' },
  chipLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    marginHorizontal: 16, borderWidth: 1, borderColor: C.border,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16 },

  tabsRow:       { paddingHorizontal: 16, gap: 8 },
  tab:           { height: 36, paddingHorizontal: 18, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  tabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  tabText:       { fontSize: 14, fontWeight: '600', color: C.secondary },
  tabTextActive: { color: C.white },

  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    marginHorizontal: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  cardIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  cardName:    { flex: 1, fontSize: 14, fontWeight: '700', color: C.text },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: '700' },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardWarehouse: { fontSize: 12, color: C.muted },
  cardStock:   { fontSize: 13, fontWeight: '700' },

  separator: { height: 10 },
  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },
});
