import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type DeadStockItem } from '../../api/analytics.api';
import { Colors } from '../../config/theme';
import { s } from './DeadStockScreen.styles';
import DeadStockCard from './DeadStockCard';
import {
  type DaysThreshold,
  type SortKey,
  THRESHOLDS,
  SORT_OPTIONS,
  fmt,
} from './dead-stock.utils';

// ─── Main Screen ──────────────────────────────────────────
export default function DeadStockScreen() {
  const navigation = useNavigation();
  const [threshold, setThreshold] = useState<DaysThreshold>(90);
  const [sortBy, setSortBy] = useState<SortKey>('carryingCost');
  const [search, setSearch] = useState('');

  const {
    data: items = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['analytics-dead-stock', threshold],
    queryFn: () => analyticsApi.getDeadStock(threshold),
    staleTime: 300_000,
  });

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          (i.sku ?? '').toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [items, search, sortBy]);

  const totalCarryingCost = useMemo(
    () => items.reduce((sum, i) => sum + i.carryingCost, 0),
    [items],
  );

  const totalStock = useMemo(
    () => items.reduce((sum, i) => sum + i.totalStock, 0),
    [items],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: DeadStockItem; index: number }) => (
      <DeadStockCard item={item} rank={index + 1} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: DeadStockItem) => item.productId, []);

  const ListHeader = useMemo(
    () => (
      <>
        {/* Alert card */}
        {items.length > 0 && (
          <View style={s.alertCard}>
            <Ionicons name="warning" size={20} color={Colors.warning} />
            <View style={s.alertInfo}>
              <Text style={s.alertTitle}>
                {items.length} ta mahsulot {threshold}+ kun sotilmagan
              </Text>
              <Text style={s.alertSub}>
                Umumiy zarar: {fmt(totalCarryingCost)} UZS
              </Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Mahsulotlar</Text>
            <Text style={s.summaryValue}>{items.length}</Text>
            <Text style={s.summarySub}>ta</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Jami zaxira</Text>
            <Text style={s.summaryValue}>{totalStock.toFixed(0)}</Text>
            <Text style={s.summarySub}>dona</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Jami zarar</Text>
            <Text style={[s.summaryValue, { color: Colors.danger }]}>
              {fmt(totalCarryingCost)}
            </Text>
            <Text style={s.summarySub}>UZS</Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Mahsulot qidirish..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sort */}
        <View style={s.sortRow}>
          <Text style={s.sortLabel}>Saralash:</Text>
          {SORT_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.key}
              style={[s.sortTab, sortBy === o.key && s.sortTabActive]}
              onPress={() => setSortBy(o.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.sortText, sortBy === o.key && s.sortTextActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    ),
    [items.length, threshold, totalCarryingCost, totalStock, search, sortBy],
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Harakatsiz Tovarlar</Text>
        <View style={s.backBtn} />
      </View>

      {/* Threshold selector */}
      <View style={s.periodRow}>
        {THRESHOLDS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[s.periodTab, threshold === t.key && s.periodTabActive]}
            onPress={() => setThreshold(t.key)}
            activeOpacity={0.75}
          >
            <Text
              style={[s.periodText, threshold === t.key && s.periodTextActive]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => {
                void refetch();
              }}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={s.emptyTextGreen}>Barcha tovarlar faol!</Text>
              <Text style={s.emptyTextSub}>
                {threshold}+ kun sotilmagan mahsulot yo'q
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
