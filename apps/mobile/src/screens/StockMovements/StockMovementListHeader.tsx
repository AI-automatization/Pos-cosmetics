// StockMovementListHeader.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockMovementColors';
import { TYPE_FILTER_CFG } from './StockMovementTypes';
import type { TypeFilter } from './StockMovementTypes';

const TYPE_FILTER_ORDER: TypeFilter[] = [
  'ALL',
  'IN',
  'OUT',
  'ADJUSTMENT',
  'TRANSFER',
  'RETURN',
  'WRITE_OFF',
];

interface StockMovementListHeaderProps {
  readonly typeFilter: TypeFilter;
  readonly onTypeChange: (f: TypeFilter) => void;
  readonly search: string;
  readonly onSearchChange: (v: string) => void;
  readonly total: number;
  readonly resultCount: number;
}

export const StockMovementListHeader = React.memo(
  function StockMovementListHeader({
    typeFilter,
    onTypeChange,
    search,
    onSearchChange,
    total,
    resultCount,
  }: StockMovementListHeaderProps) {
    const handleClearSearch = useCallback(() => onSearchChange(''), [onSearchChange]);

    return (
      <View style={styles.container}>
        {/* Type filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {TYPE_FILTER_ORDER.map((key) => {
            const isActive = typeFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onTypeChange(key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {TYPE_FILTER_CFG[key].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search input */}
        <View style={styles.searchRow}>
          <Ionicons
            name="search-outline"
            size={18}
            color={C.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Mahsulot nomini qidiring..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Result count */}
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {resultCount} ta harakat
            {total > 0 && resultCount !== total
              ? ` (jami ${total} dan)`
              : ''}
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  chipScroll: {
    marginBottom: 10,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap:               8,
    flexDirection:     'row',
    alignItems:        'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      20,
    backgroundColor:   C.white,
    borderWidth:       1,
    borderColor:       C.border,
  },
  chipActive: {
    backgroundColor: C.primary,
    borderColor:     C.primary,
  },
  chipText: {
    fontSize:   13,
    fontWeight: '600',
    color:      C.secondary,
  },
  chipTextActive: {
    color: C.white,
  },
  searchRow: {
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  16,
    marginBottom:      8,
    backgroundColor:   C.white,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       C.border,
    paddingHorizontal: 12,
    height:            44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    C.text,
  },
  resultRow: {
    paddingHorizontal: 16,
    paddingBottom:     8,
  },
  resultText: {
    fontSize: 13,
    color:    C.muted,
  },
});
