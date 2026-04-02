import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../../components/layout/ScreenLayout';
import WarehouseList from './WarehouseList';
import { useWarehouseData, WarehouseTab } from './useWarehouseData';
import { Colors, Radii } from '../../config/theme';

type Tab = { key: WarehouseTab; label: string; icon: string };

const TABS: Tab[] = [
  { key: 'all',      label: 'Barchasi',        icon: '' },
  { key: 'low',      label: '🔴 Kam qolgan',   icon: '' },
  { key: 'expiring', label: '🟡 Muddati yaqin', icon: '' },
];

export default function WarehouseScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<WarehouseTab>('all');
  const [search, setSearch] = useState('');
  const { stock } = useWarehouseData(activeTab);

  const items = stock.data ?? [];

  return (
    <ScreenLayout title={t('warehouse.title', 'Ombor')}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('warehouse.searchPlaceholder', 'Nomi yoki shtrix-kod...')}
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <WarehouseList
        items={items}
        search={search}
        isRefreshing={stock.isFetching}
        onRefresh={() => { void stock.refetch(); }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgSubtle,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.textWhite },
});
