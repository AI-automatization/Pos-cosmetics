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
import { Ionicons } from '@expo/vector-icons';
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
        <Ionicons name="search-outline" size={16} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mahsulot yoki ombor nomi..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.75}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
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
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 8,
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
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 12,
    color: C.muted,
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
