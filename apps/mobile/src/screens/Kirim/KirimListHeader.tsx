// KirimListHeader.tsx — qidiruv, filter tablar va natijalar soni
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { C } from './KirimColors';
import { TABS } from './KirimTypes';
import type { FilterTab } from './KirimTypes';
import { StatsChips } from './KirimStatsChips';

interface KirimListHeaderProps {
  readonly allReceipts: Receipt[];
  readonly search: string;
  readonly activeTab: FilterTab;
  readonly resultCount: number;
  readonly onSearchChange: (text: string) => void;
  readonly onTabChange: (tab: FilterTab) => void;
  readonly listRef: React.RefObject<FlatList<Receipt> | null>;
}

export function KirimListHeader({
  allReceipts,
  search,
  activeTab,
  resultCount,
  onSearchChange,
  onTabChange,
  listRef,
}: KirimListHeaderProps) {
  const handleTabPress = (key: FilterTab) => {
    onTabChange(key);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={styles.listHeader}>
      <StatsChips receipts={allReceipts} />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={C.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Raqam yoki yetkazib beruvchi..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
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
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{resultCount} ta kirim</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    gap: 12,
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16 },
  tabsRow:     { paddingHorizontal: 16, gap: 8 },
  tab: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive:     { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  tabText:       { fontSize: 12, fontWeight: '700', color: C.secondary },
  tabTextActive: { color: C.white },
});
