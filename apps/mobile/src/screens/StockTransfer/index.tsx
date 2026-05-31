// StockTransfer/index.tsx — filiallar arasi mahsulot o'tkazish ekrani

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import { StockListHeader } from './StockListHeader';
import { styles } from './StockTransfer.styles';
import type { StockLevel } from './StockTransferTypes';
import TransferListView from './TransferListView';

type NavProp = NativeStackNavigationProp<MoreStackParamList, 'TransferScreen'>;

const Separator = () => <View style={styles.separator} />;

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

  const handleSheetClose = useCallback(() => {
    setSheet(false);
    setSelectedItem(null);
  }, []);

  const handleSelect = useCallback((selected: StockLevel) => {
    setSelectedItem(selected);
    setSheet(true);
  }, []);

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleAddPress = useCallback(() => {
    setActiveTab('create');
    setSheet(true);
  }, []);

  // Ruxsat yo'q
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockTransferHeader onBack={handleGoBack} onAdd={handleAddPress} />
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
        <StockTransferHeader onBack={handleGoBack} onAdd={handleAddPress} />
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
        <StockTransferHeader onBack={handleGoBack} onAdd={handleAddPress} />
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
      <StockTransferHeader onBack={handleGoBack} onAdd={handleAddPress} />

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
              <StockListHeader
                allItems={allItems}
                filteredCount={filtered.length}
                search={search}
                onSearchChange={setSearch}
              />
            }
            renderItem={({ item }) => (
              <StockTransferProductCard item={item} onSelect={handleSelect} />
            )}
            ItemSeparatorComponent={Separator}
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
            onSuccess={handleSheetClose}
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
