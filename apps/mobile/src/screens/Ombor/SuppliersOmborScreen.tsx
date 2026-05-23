// Ombor — SuppliersOmborScreen: supplier list with search + active/inactive filter
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog.api';
import type { Supplier } from '../../api/catalog.api';
import type { OmborTabStackParamList } from '../../navigation/types';
import SupplierCard from './SupplierCard';
import NewSupplierSheet from './NewSupplierSheet';
import { C } from './OmborColors';

// ─── Types ────────────────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<OmborTabStackParamList, 'SuppliersOmborScreen'>;

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const FILTER_TABS: { key: ActiveFilter; label: string }[] = [
  { key: 'ALL',      label: 'Barchasi' },
  { key: 'ACTIVE',   label: 'Faol' },
  { key: 'INACTIVE', label: 'Nofaol' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SuppliersOmborScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveFilter>('ALL');
  const [search, setSearch] = useState('');
  const [showNewSheet, setShowNewSheet] = useState(false);

  const suppliers = useQuery<Supplier[]>({
    queryKey: ['ombor-suppliers'],
    queryFn: () => catalogApi.getSuppliers(),
    staleTime: 30_000,
  });

  const items = suppliers.data ?? [];

  // Count per tab
  const counts = useMemo(() => {
    const c = { ALL: items.length, ACTIVE: 0, INACTIVE: 0 };
    for (const s of items) {
      if (s.isActive) c.ACTIVE++;
      else c.INACTIVE++;
    }
    return c;
  }, [items]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = items;
    if (activeTab === 'ACTIVE') list = list.filter((s) => s.isActive);
    if (activeTab === 'INACTIVE') list = list.filter((s) => !s.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.company?.toLowerCase().includes(q) ||
          s.phone?.includes(q),
      );
    }
    return list;
  }, [items, activeTab, search]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('SupplierDetailScreen', { supplierId: id });
    },
    [navigation],
  );

  const handleNewSuccess = useCallback(() => {
    setShowNewSheet(false);
    queryClient.invalidateQueries({ queryKey: ['ombor-suppliers'] });
  }, [queryClient]);

  // ─── Error state ──────────────────────────────────────────────────────────
  if (suppliers.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBackBtn}
          >
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yetkazib beruvchilar</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => suppliers.refetch()}
            activeOpacity={0.75}
          >
            <Text style={styles.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerBackBtn}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Yetkazib beruvchilar</Text>
          {!suppliers.isLoading && (
            <Text style={styles.headerCount}>{items.length} ta</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowNewSheet(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerAddBtn}
        >
          <Ionicons name="add-circle" size={28} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Qidirish..."
            placeholderTextColor={C.muted}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                  {counts[tab.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Result count */}
      {(search.length > 0 || activeTab !== 'ALL') && !suppliers.isLoading && (
        <Text style={styles.resultCount}>{filtered.length} ta natija</Text>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SupplierCard item={item} onPress={handleCardPress} />
        )}
        refreshing={suppliers.isLoading}
        onRefresh={() => suppliers.refetch()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          suppliers.isLoading ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={C.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>
                {search || activeTab !== 'ALL'
                  ? 'Natija topilmadi'
                  : "Yetkazib beruvchilar yo'q"}
              </Text>
            </View>
          )
        }
      />

      {/* New Supplier Sheet */}
      <NewSupplierSheet
        visible={showNewSheet}
        onClose={() => setShowNewSheet(false)}
        onSuccess={handleNewSuccess}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBackBtn: { minWidth: 48, minHeight: 48, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  headerCount: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerRight: { minWidth: 48 },
  headerAddBtn: { minWidth: 48, minHeight: 48, alignItems: 'flex-end', justifyContent: 'center' },

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: C.white },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },

  // Filter tabs
  filterRow: {
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6',
  },
  filterTabActive: { backgroundColor: C.primary },
  filterTabText: { fontSize: 12, fontWeight: '600', color: C.muted },
  filterTabTextActive: { color: C.white },
  filterBadge: {
    minWidth: 20, height: 18, borderRadius: 9, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: C.secondary },
  filterBadgeTextActive: { color: C.white },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 20, paddingTop: 8 },

  // List
  listContent: { padding: 16 },

  // States
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 80 },
  errorText: { fontSize: 15, color: C.muted },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10,
    backgroundColor: C.primary, minHeight: 48, alignItems: 'center', justifyContent: 'center',
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  emptyState: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },
});
