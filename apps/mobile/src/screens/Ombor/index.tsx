// Ombor screen — stock levels with stats, search, filter tabs and request sheet
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
import type { LowStockItem } from '../../api/inventory.api';
import { useOmborData } from './useOmborData';
import OmborRequestSheet from './OmborRequestSheet';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:        '#F5F5F7',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#F3F4F6',
  primary:   '#5B5BD6',
  green:     '#10B981',
  orange:    '#F59E0B',
  red:       '#EF4444',
};

// ─── Stock status ───────────────────────────────────────
type StockStatus = 'MAVJUD' | 'KAM' | 'TUGADI';

function getStatus(item: LowStockItem): StockStatus {
  if (item.stock === 0) return 'TUGADI';
  if (item.stock <= item.minStockLevel) return 'KAM';
  return 'MAVJUD';
}

const STATUS_CFG: Record<
  StockStatus,
  { iconBg: string; iconColor: string; badgeBg: string; badgeText: string; stockColor: string; label: string }
> = {
  MAVJUD: {
    iconBg:    '#EEF2FF',
    iconColor: '#5B5BD6',
    badgeBg:   '#D1FAE5',
    badgeText: '#10B981',
    stockColor: '#10B981',
    label:     'MAVJUD',
  },
  KAM: {
    iconBg:    '#FEF3C7',
    iconColor: '#F59E0B',
    badgeBg:   '#FEF3C7',
    badgeText: '#F59E0B',
    stockColor: '#F59E0B',
    label:     'KAM',
  },
  TUGADI: {
    iconBg:    '#FEE2E2',
    iconColor: '#EF4444',
    badgeBg:   '#FEE2E2',
    badgeText: '#EF4444',
    stockColor: '#EF4444',
    label:     'TUGADI',
  },
};

// ─── Filter tabs ────────────────────────────────────────
type FilterTab = 'ALL' | 'KAM' | 'TUGADI';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',    label: 'Hammasi' },
  { key: 'KAM',   label: 'Kam'     },
  { key: 'TUGADI', label: 'Tugadi' },
];

// ─── Header ────────────────────────────────────────────
function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="cube-outline" size={28} color={C.primary} />
        <Text style={styles.headerTitle}>Ombor</Text>
      </View>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={C.secondary} />
      </View>
    </View>
  );
}

// ─── Stats row ──────────────────────────────────────────
function StatsRow({ items }: { items: LowStockItem[] }) {
  const total  = items.length;
  const kam    = items.filter((i) => getStatus(i) === 'KAM').length;
  const tugadi = items.filter((i) => getStatus(i) === 'TUGADI').length;
  const normal = total - kam - tugadi;

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>JAMI</Text>
        <Text style={[styles.statValue, { color: C.primary }]}>{total}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderGreen]}>
        <Text style={styles.statLabel}>NORMAL</Text>
        <Text style={[styles.statValue, { color: C.green }]}>{normal}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderOrange]}>
        <Text style={styles.statLabel}>KAM</Text>
        <Text style={[styles.statValue, { color: C.orange }]}>{kam}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderRed]}>
        <Text style={styles.statLabel}>TUGADI</Text>
        <Text style={[styles.statValue, { color: C.red }]}>{tugadi}</Text>
      </View>
    </View>
  );
}

// ─── Product card ───────────────────────────────────────
function ProductCard({ item }: { item: LowStockItem }) {
  const status = getStatus(item);
  const cfg    = STATUS_CFG[status];

  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: cfg.iconBg }]}>
        <Ionicons name="cube-outline" size={22} color={cfg.iconColor} />
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.cardName} numberOfLines={2}>{item.productName}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={C.muted} />
          <Text style={styles.warehouseText}>{item.warehouseName}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.stockText, { color: cfg.stockColor }]}>
          {item.stock} / min {item.minStockLevel}
        </Text>
        <View style={[styles.badge, { backgroundColor: cfg.badgeBg }]}>
          <Text style={[styles.badgeText, { color: cfg.badgeText }]}>{cfg.label}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Empty state ────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.muted} />
      <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────
export default function OmborScreen() {
  const [search, setSearch]                     = useState('');
  const [activeTab, setActiveTab]               = useState<FilterTab>('ALL');
  const [requestSheetVisible, setRequestSheetVisible] = useState(false);

  const { stockLevels } = useOmborData();
  const { data, isLoading, isError, refetch } = stockLevels;

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
        (activeTab === 'KAM'    && status === 'KAM')    ||
        (activeTab === 'TUGADI' && status === 'TUGADI');
      return matchSearch && matchTab;
    });
  }, [search, activeTab, allItems]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.centerFill}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={C.muted} />
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

  const ListHeader = (
    <>
      <StatsRow items={allItems} />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mahsulot yoki ombor nomi..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.75}>
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

      {/* Result count */}
      <Text style={styles.resultCount}>{filtered.length} ta mahsulot</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />

      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => <ProductCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState />}
      />

      {/* Sticky bottom button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => setRequestSheetVisible(true)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="clipboard-list-outline" size={20} color={C.white} />
          <Text style={styles.requestBtnText}>Katta omborga so'rov yuborish</Text>
        </TouchableOpacity>
      </View>

      <OmborRequestSheet
        visible={requestSheetVisible}
        onClose={() => setRequestSheetVisible(false)}
        items={allItems}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
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
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statBorderGreen:  { borderLeftWidth: 3, borderLeftColor: '#10B981' },
  statBorderOrange: { borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  statBorderRed:    { borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },

  // Filter tabs
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
  },
  tab: {
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 17,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
  },
  tabTextActive: {
    color: C.primary,
    fontWeight: '700',
  },

  // Result count
  resultCount: {
    fontSize: 12,
    color: C.muted,
    paddingHorizontal: 16,
    marginTop: 8,
  },

  // List
  listContent: {
    paddingTop: 14,
    paddingBottom: 100,
  },

  // Product card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMiddle: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  warehouseText: {
    fontSize: 12,
    color: C.muted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // Separator
  separator: {
    height: 10,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },

  // Loading / error
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    color: C.muted,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },

  // Bottom sticky bar
  bottomBar: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
  },
  requestBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
