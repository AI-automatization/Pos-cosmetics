import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import InventoryList from './InventoryList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import { useInventory, InventoryTabStatus } from '../../hooks/useInventory';
import { Colors, Radii } from '../../config/theme';

type Tab = { key: InventoryTabStatus; labelKey: string };

const TABS: Tab[] = [
  { key: 'all', labelKey: 'inventory.all' },
  { key: 'low', labelKey: 'inventory.low' },
  { key: 'out_of_stock', labelKey: 'inventory.outOfStock' },
  { key: 'expiring', labelKey: 'inventory.expiring' },
  { key: 'expired', labelKey: 'inventory.expired' },
];

export default function InventoryScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<InventoryTabStatus>('all');
  const { stock } = useInventory(activeTab);

  const displayItems = stock.data?.items ?? [];
  const totalCount = stock.data?.total ?? 0;

  if (stock.isLoading) {
    return (
      <ScreenLayout title={t('inventory.title')}>
        <LoadingSpinner />
      </ScreenLayout>
    );
  }

  if (stock.isError) {
    return (
      <ScreenLayout title={t('inventory.title')}>
        <ErrorView error={stock.error} onRetry={() => { void stock.refetch(); }} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('inventory.title')}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {totalCount > 0 && (
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            {t('inventory.totalFound', { count: totalCount })}
          </Text>
        </View>
      )}

      <InventoryList
        items={displayItems}
        isRefreshing={stock.isFetching}
        onRefresh={() => { void stock.refetch(); }}
        status={activeTab}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexWrap: 'wrap',
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
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.bgSubtle,
  },
  countText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
