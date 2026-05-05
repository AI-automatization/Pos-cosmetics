// StockOutListHeader.tsx — qidiruv va statistika komponenti

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockOutColors';
import type { StockLevel } from './StockOutTypes';

interface StockOutListHeaderProps {
  readonly items:          StockLevel[];
  readonly search:         string;
  readonly resultCount:    number;
  readonly onSearchChange: (text: string) => void;
}

export const StockOutListHeader = React.memo(function StockOutListHeader({
  items,
  search,
  resultCount,
  onSearchChange,
}: StockOutListHeaderProps) {
  const total   = items.length;
  const low     = items.filter(
    (i) => i.minStockLevel !== null && i.totalQty > 0 && i.totalQty <= i.minStockLevel,
  ).length;
  const outOf   = items.filter((i) => i.totalQty <= 0).length;

  return (
    <View style={styles.container}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>JAMI MAHSULOT</Text>
          <Text style={[styles.statValue, { color: C.primary }]}>{total}</Text>
        </View>
        <View style={[styles.statCard, styles.borderOrange]}>
          <Text style={styles.statLabel}>KAM QOLGAN</Text>
          <Text style={[styles.statValue, { color: C.orange }]}>{low}</Text>
        </View>
        <View style={[styles.statCard, styles.borderRed]}>
          <Text style={styles.statLabel}>TUGAGAN</Text>
          <Text style={[styles.statValue, { color: C.red }]}>{outOf}</Text>
        </View>
      </View>

      {/* Search input */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={C.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mahsulot yoki ombor nomi..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.resultCount}>{resultCount} ta mahsulot</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap:           12,
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection:    'row',
    gap:              8,
    paddingHorizontal: 16,
    paddingVertical:  14,
    backgroundColor:  C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  statCard: {
    flex:            1,
    backgroundColor: C.white,
    borderRadius:    12,
    padding:         12,
    gap:             4,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  borderOrange: { borderLeftWidth: 3, borderLeftColor: C.orange },
  borderRed:    { borderLeftWidth: 3, borderLeftColor: C.red },
  statLabel: {
    fontSize:    9,
    fontWeight:  '700',
    color:       C.muted,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize:   22,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  C.white,
    borderRadius:     12,
    paddingHorizontal: 14,
    height:           46,
    marginHorizontal: 16,
    borderWidth:      1,
    borderColor:      C.border,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16 },
});
