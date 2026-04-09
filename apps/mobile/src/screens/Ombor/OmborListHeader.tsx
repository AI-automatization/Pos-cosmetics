// Ombor screen — FlatList header: search + filter tabs + result count
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from './OmborColors';
import { TABS, type FilterTab } from './OmborTypes';
import type { LowStockItem } from '../../api/inventory.api';
import OmborStatsRow from './OmborStatsRow';

interface OmborListHeaderProps {
  readonly allItems:    LowStockItem[];
  readonly search:      string;
  readonly activeTab:   FilterTab;
  readonly resultCount: number;
  readonly onSearchChange: (text: string) => void;
  readonly onTabChange:    (tab: FilterTab) => void;
}

export default function OmborListHeader({
  allItems,
  search,
  activeTab,
  resultCount,
  onSearchChange,
  onTabChange,
}: OmborListHeaderProps) {
  return (
    <>
      <OmborStatsRow items={allItems} />

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mahsulot yoki ombor nomi..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.75}>
            <Feather name="x" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{resultCount} ta mahsulot</Text>
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
  },
  tab: {
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 17,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
  },
  tabTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 12,
    color: C.muted,
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
