// StockOut/index.tsx — Hisobdan chiqarish asosiy ekrani

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
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
import { useStockOutData } from './useStockOutData';
import { StockOutHeader } from './StockOutHeader';
import { StockOutListHeader } from './StockOutListHeader';
import { StockOutProductCard } from './StockOutProductCard';
import NewStockOutSheet from './NewStockOutSheet';
import { C, STOCK_OUT_ROLES } from './StockOutColors';
import type { StockLevel } from './StockOutTypes';

type NavProp = NativeStackNavigationProp<MoreStackParamList, 'StockOutScreen'>;

export default function StockOutScreen() {
  const navigation = useNavigation<NavProp>();
  const { user }   = useAuthStore();

  const [search,       setSearch]  = useState('');
  const [selectedItem, setSelected] = useState<StockLevel | null>(null);
  const [sheetVisible, setSheet]   = useState(false);

  const hasAccess = STOCK_OUT_ROLES.includes(
    user?.role as typeof STOCK_OUT_ROLES[number],
  );

  const { stockLevels, writeOffMutation } = useStockOutData();
  const allItems = stockLevels.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.warehouseName.toLowerCase().includes(q),
    );
  }, [search, allItems]);

  const handleSelect = (item: StockLevel) => {
    setSelected(item);
    setSheet(true);
  };

  const handleSheetClose = () => {
    setSheet(false);
    setSelected(null);
  };

  const handleSuccess = () => {
    setSheet(false);
    setSelected(null);
  };

  // Ruxsat yo'q
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockOutHeader
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
        <StockOutHeader
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
        <StockOutHeader
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
      <StockOutHeader
        onBack={() => navigation.goBack()}
        onAdd={() => setSheet(true)}
      />

      <FlatList<StockLevel>
        data={filtered}
        keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <StockOutListHeader
            items={allItems}
            search={search}
            resultCount={filtered.length}
            onSearchChange={setSearch}
          />
        }
        renderItem={({ item }) => (
          <StockOutProductCard item={item} onSelect={handleSelect} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="archive-outline" size={48} color={C.muted} />
            <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
          </View>
        }
      />

      <NewStockOutSheet
        visible={sheetVisible}
        selectedItem={selectedItem}
        writeOffMutation={writeOffMutation}
        onClose={handleSheetClose}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: C.bg,
  },
  content:        { paddingBottom: 32 },
  centerFill:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText:      { fontSize: 15, color: C.muted },
  errorTextSmall: { fontSize: 12, color: C.muted, marginTop: -8 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      10,
    backgroundColor:   C.primary,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  separator:    { height: 10 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontSize: 15, color: C.muted },
});
