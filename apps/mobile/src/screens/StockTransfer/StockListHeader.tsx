// StockListHeader.tsx — statistika va qidiruv paneli

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockTransferColors';
import { styles } from './StockTransfer.styles';
import type { StockLevel } from './StockTransferTypes';

interface StockListHeaderProps {
  readonly allItems: ReadonlyArray<StockLevel>;
  readonly filteredCount: number;
  readonly search: string;
  readonly onSearchChange: (text: string) => void;
}

export function StockListHeader({
  allItems,
  filteredCount,
  search,
  onSearchChange,
}: StockListHeaderProps) {
  const lowStockCount = allItems.filter(
    (i) => i.minStockLevel !== null && i.totalQty <= i.minStockLevel && i.totalQty > 0,
  ).length;
  const outOfStockCount = allItems.filter((i) => i.totalQty <= 0).length;

  return (
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
            {lowStockCount}
          </Text>
          <Text style={styles.statLabel}>Kam qolgan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: C.red }]}>
            {outOfStockCount}
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
          onChangeText={onSearchChange}
          placeholder="Mahsulot yoki ombor nomi..."
          placeholderTextColor={C.muted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {search.trim().length > 0 && (
        <Text style={styles.resultCount}>
          {filteredCount} ta natija
        </Text>
      )}
    </View>
  );
}
