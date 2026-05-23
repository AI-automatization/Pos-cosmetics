// StockTransfer/index.tsx — filiallar arasi mahsulot o'tkazish ekrani

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';
import { useStockTransferData } from './useStockTransferData';
import { StockTransferHeader } from './StockTransferHeader';
import { StockTransferProductCard } from './StockTransferProductCard';
import NewTransferSheet from './NewTransferSheet';
import { C, TRANSFER_ROLES } from './StockTransferColors';
import type { StockLevel } from './StockTransferTypes';
import TransferListView from './TransferListView';

type NavProp = NativeStackNavigationProp<MoreStackParamList, 'TransferScreen'>;

export default function StockTransferScreen() {
  const navigation = useNavigation<NavProp>();
  const { user }   = useAuthStore();

  const [search,        setSearch]       = useState('');
  const [sheetVisible,  setSheet]        = useState(false);
  const [selectedItem,  setSelectedItem] = useState<StockLevel | null>(null);
  const [activeTab,     setActiveTab]    = useState<'create' | 'list'>('create');

  const hasAccess = TRANSFER_ROLES.includes(
    user?.role as typeof TRANSFER_ROLES[number],
  );

  const { stockLevels, branches, createTransfer } = useStockTransferData();
  const allItems = stockLevels.data ?? [];

  const filtered = useMemo<StockLevel[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.warehouseName.toLowerCase().includes(q),
    );
  }, [search, allItems]);

  const handleSheetClose = () => { setSheet(false); setSelectedItem(null); };
  const handleSuccess    = () => { setSheet(false); setSelectedItem(null); };

  // Ruxsat yo'q
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockTransferHeader
          onBack={() => navigation.goBack()}
          onAdd={() => {}}
        />
        <View style={styles.centerFill}>
          <Ionicons name="lock-closed-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Bu bo'lim uchun ruxsat yo'q</Text>
          <Text style={styles.errorTextSmall}>Kerakli rol: Manager, Admin, Owner</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Yuklanmoqda
  if (stockLevels.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockTransferHeader
          onBack={() => navigation.goBack()}
          onAdd={() => {}}
        />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Xatolik
  if (stockLevels.isError) {
    const is403 =
      (stockLevels.error as { response?: { status?: number } })?.response?.status === 403;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockTransferHeader
          onBack={() => navigation.goBack()}
          onAdd={() => {}}
        />
        <View style={styles.centerFill}>
          <Ionicons
            name={is403 ? 'lock-closed-outline' : 'alert-circle-outline'}
            size={48}
            color={C.muted}
          />
          <Text style={styles.errorText}>
            {is403 ? "Bu bo'lim uchun ruxsat yo'q" : "Ma'lumot yuklanmadi"}
          </Text>
          {!is403 && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => void stockLevels.refetch()}
              activeOpacity={0.75}
            >
              <Text style={styles.retryBtnText}>Qayta urinish</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StockTransferHeader
        onBack={() => navigation.goBack()}
        onAdd={() => { setActiveTab('create'); setSheet(true); }}
      />

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.tabActive]}
          onPress={() => setActiveTab('create')}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            Yangi transfer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            Ro'yxat
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? (
        <>
          <FlatList<StockLevel>
            data={filtered}
            keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {/* Statistika satri */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{allItems.length}</Text>
                    <Text style={styles.statLabel}>Jami mahsulot</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: C.orange }]}>
                      {allItems.filter(
                        (i) => i.minStockLevel !== null && i.totalQty <= i.minStockLevel && i.totalQty > 0,
                      ).length}
                    </Text>
                    <Text style={styles.statLabel}>Kam qolgan</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: C.red }]}>
                      {allItems.filter((i) => i.totalQty <= 0).length}
                    </Text>
                    <Text style={styles.statLabel}>Tugagan</Text>
                  </View>
                </View>

                {/* Qidiruv */}
                <View style={styles.searchBox}>
                  <Ionicons name="search-outline" size={16} color={C.muted} />
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Mahsulot yoki ombor nomi..."
                    placeholderTextColor={C.muted}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                  />
                </View>

                {search.trim().length > 0 && (
                  <Text style={styles.resultCount}>
                    {filtered.length} ta natija
                  </Text>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <StockTransferProductCard
                item={item}
                onSelect={(selected) => { setSelectedItem(selected); setSheet(true); }}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="swap-horizontal-outline" size={48} color={C.muted} />
                <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
                {search.trim().length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.75}>
                    <Text style={styles.clearSearch}>Qidiruvni tozalash</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />

          <NewTransferSheet
            visible={sheetVisible}
            onClose={handleSheetClose}
            onSuccess={handleSuccess}
            stockLevels={stockLevels}
            branches={branches}
            createTransfer={createTransfer}
            selectedProduct={selectedItem}
          />
        </>
      ) : (
        <TransferListView />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: C.bg,
  },
  content: { paddingBottom: 32 },
  centerFill: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            16,
  },
  errorText: {
    fontSize: 15,
    color:    C.muted,
  },
  errorTextSmall: {
    fontSize:  12,
    color:     C.muted,
    marginTop: -8,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      10,
    backgroundColor:   C.primary,
  },
  retryBtnText: {
    fontSize:   14,
    fontWeight: '700',
    color:      C.white,
  },

  // List header
  listHeader: {
    paddingTop: 16,
    gap:        12,
  },
  statsRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     C.border,
    paddingVertical: 12,
  },
  statItem: {
    flex:       1,
    alignItems: 'center',
    gap:        2,
  },
  statValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      C.text,
  },
  statLabel: {
    fontSize: 11,
    color:    C.muted,
  },
  statDivider: {
    width:           1,
    height:          32,
    backgroundColor: C.border,
  },

  // Qidiruv
  searchBox: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   C.white,
    marginHorizontal:  16,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       C.border,
    paddingHorizontal: 12,
    paddingVertical:   10,
  },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    C.text,
    padding:  0,
  },
  resultCount: {
    fontSize:          12,
    color:             C.muted,
    paddingHorizontal: 20,
    marginTop:         -4,
  },

  separator: { height: 10 },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap:        12,
  },
  emptyText: {
    fontSize: 15,
    color:    C.muted,
  },
  clearSearch: {
    fontSize:   14,
    color:      C.primary,
    fontWeight: '600',
  },

  // Tabs
  tabs: {
    flexDirection:   'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: C.primary,
  },
  tabText: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.muted,
  },
  tabTextActive: {
    color: C.primary,
  },
});
