// index.tsx — Harakatlar tarixi ekrani (infinite scroll)

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';
import { useStockMovementData } from './useStockMovementData';
import { StockMovementHeader } from './StockMovementHeader';
import { StockMovementListHeader } from './StockMovementListHeader';
import { StockMovementCard } from './StockMovementCard';
import { C, MOVEMENT_ROLES } from './StockMovementColors';
import type { StockMovement, TypeFilter } from './StockMovementTypes';

type NavProp = NativeStackNavigationProp<MoreStackParamList, 'StockMovementsScreen'>;

const TYPE_FILTER_MAP: Record<TypeFilter, readonly string[]> = {
  ALL:        ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN_IN', 'TESTER', 'WRITE_OFF'],
  IN:         ['IN'],
  OUT:        ['OUT'],
  ADJUSTMENT: ['ADJUSTMENT'],
  TRANSFER:   ['TRANSFER_IN', 'TRANSFER_OUT'],
  RETURN:     ['RETURN_IN'],
  WRITE_OFF:  ['WRITE_OFF'],
} as const;

export default function StockMovementsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [search, setSearch]         = useState('');

  const hasAccess = MOVEMENT_ROLES.includes(
    user?.role as typeof MOVEMENT_ROLES[number],
  );

  const { movements } = useStockMovementData();

  // Flatten all pages into a single array
  const allItems: StockMovement[] = useMemo(
    () => movements.data?.pages?.flatMap((p) => p.items) ?? [],
    [movements.data?.pages],
  );

  const totalCount = movements.data?.pages?.[0]?.total ?? 0;

  const filtered = useMemo(() => {
    const allowedTypes = TYPE_FILTER_MAP[typeFilter];
    const q = search.toLowerCase().trim();

    return allItems.filter((item) => {
      if (!allowedTypes.includes(item.type)) return false;
      if (!q) return true;
      const productName  = (item.product?.name ?? '').toLowerCase();
      const note         = (item.note ?? '').toLowerCase();
      const warehouseName = (item.warehouse?.name ?? '').toLowerCase();
      return (
        productName.includes(q) ||
        note.includes(q) ||
        warehouseName.includes(q)
      );
    });
  }, [allItems, typeFilter, search]);

  const handleBack        = useCallback(() => navigation.goBack(), [navigation]);
  const handleTypeChange  = useCallback((f: TypeFilter) => setTypeFilter(f), []);
  const handleSearchChange = useCallback((v: string) => setSearch(v), []);

  const handleLoadMore = useCallback(() => {
    if (movements.hasNextPage && !movements.isFetchingNextPage) {
      void movements.fetchNextPage();
    }
  }, [movements]);

  const renderItem = useCallback(
    ({ item }: { item: StockMovement }) => <StockMovementCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: StockMovement) => item.id,
    [],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderListHeader = useMemo(
    () => (
      <StockMovementListHeader
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        search={search}
        onSearchChange={handleSearchChange}
        total={totalCount}
        resultCount={filtered.length}
      />
    ),
    [
      typeFilter,
      search,
      filtered.length,
      totalCount,
      handleTypeChange,
      handleSearchChange,
    ],
  );

  const renderFooter = useCallback(() => {
    if (!movements.isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={C.primary} />
        <Text style={styles.footerText}>Yuklanmoqda...</Text>
      </View>
    );
  }, [movements.isFetchingNextPage]);

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockMovementHeader onBack={handleBack} />
        <View style={styles.centerFill}>
          <Ionicons name="lock-closed-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Bu bo'lim uchun ruxsat yo'q</Text>
          <Text style={styles.errorSub}>Kerakli rol: Manager, Admin, Egasi</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (movements.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockMovementHeader onBack={handleBack} />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (movements.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StockMovementHeader onBack={handleBack} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => void movements.refetch()}
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
      <StockMovementHeader onBack={handleBack} />
      <FlatList<StockMovement>
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="swap-horizontal-outline" size={48} color={C.muted} />
            <Text style={styles.emptyText}>Harakatlar topilmadi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: C.bg,
  },
  content: {
    paddingBottom: 32,
  },
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
  errorSub: {
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
  separator: {
    height: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap:        12,
  },
  emptyText: {
    fontSize: 15,
    color:    C.muted,
  },
  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    color:    C.muted,
  },
});
