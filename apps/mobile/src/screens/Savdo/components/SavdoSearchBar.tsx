import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C } from './utils';

interface SavdoSearchBarProps {
  readonly search: string;
  readonly onSearch: (value: string) => void;
  readonly onScanPress: () => void;
}

export default function SavdoSearchBar({
  search,
  onSearch,
  onScanPress,
}: SavdoSearchBarProps) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchInput}>
        <Feather name="search" size={16} color={C.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchText}
          placeholder="Mahsulot qidirish..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={onSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch('')}>
            <Feather name="x" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.scanButton}
        activeOpacity={0.8}
        onPress={onScanPress}
      >
        <Ionicons name="barcode-outline" size={22} color={C.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
