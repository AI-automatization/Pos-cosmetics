import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import InventoryList from './InventoryList';
import { useInventory, InventoryTabStatus } from '../../hooks/useInventory';
import { Colors, Radii } from '../../config/theme';
import { InventoryItem } from '../../api/inventory.api';

type Tab = { key: InventoryTabStatus; labelKey: string };

const TABS: Tab[] = [
  { key: 'all', labelKey: 'inventory.all' },
  { key: 'low', labelKey: 'inventory.low' },
  { key: 'out_of_stock', labelKey: 'inventory.outOfStock' },
  { key: 'expiring', labelKey: 'inventory.expiring' },
  { key: 'expired', labelKey: 'inventory.expired' },
];

const MOCK_ITEMS: InventoryItem[] = [
  { id: 'm1', productName: 'Chanel No.5 EDP 100ml', barcode: '3145891253317', quantity: 8, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 320_000, stockValue: 2_560_000, reorderLevel: 5, expiryDate: '2026-12-01', status: 'normal' },
  { id: 'm2', productName: 'Dior Sauvage EDT 60ml', barcode: '3348901419610', quantity: 3, unit: 'dona', branchName: 'Yunusabad', branchId: 'b2', costPrice: 285_000, stockValue: 855_000, reorderLevel: 5, expiryDate: '2026-08-15', status: 'low' },
  { id: 'm3', productName: "L'Oreal Elvive Shampoo", barcode: '3600523562985', quantity: 0, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 42_000, stockValue: 0, reorderLevel: 10, expiryDate: null, status: 'out_of_stock' },
  { id: 'm4', productName: 'Nivea Moisturizing Cream', barcode: '4005900134141', quantity: 12, unit: 'dona', branchName: 'Sergeli', branchId: 'b3', costPrice: 28_000, stockValue: 336_000, reorderLevel: 15, expiryDate: '2026-04-10', status: 'expiring' },
  { id: 'm5', productName: "MAC Studio Fix Foundation", barcode: '0773602519606', quantity: 4, unit: 'dona', branchName: 'Mirzo Ulug\'bek', branchId: 'b4', costPrice: 195_000, stockValue: 780_000, reorderLevel: 5, expiryDate: '2025-12-01', status: 'expired' },
  { id: 'm6', productName: 'Versace Eros EDT 100ml', barcode: '8011003818303', quantity: 15, unit: 'dona', branchName: 'Yunusabad', branchId: 'b2', costPrice: 310_000, stockValue: 4_650_000, reorderLevel: 5, expiryDate: '2027-03-20', status: 'normal' },
  { id: 'm7', productName: 'Garnier Micellar Water', barcode: '3600541520097', quantity: 2, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 35_000, stockValue: 70_000, reorderLevel: 8, expiryDate: null, status: 'low' },
  { id: 'm8', productName: 'NYX Matte Lipstick', barcode: '0800897155681', quantity: 22, unit: 'dona', branchName: 'Mirzo Ulug\'bek', branchId: 'b4', costPrice: 58_000, stockValue: 1_276_000, reorderLevel: 10, expiryDate: null, status: 'normal' },
];

const MOCK_BY_STATUS: Record<InventoryTabStatus, InventoryItem[]> = {
  all: MOCK_ITEMS,
  normal: MOCK_ITEMS.filter((i) => i.status === 'normal'),
  low: MOCK_ITEMS.filter((i) => i.status === 'low'),
  out_of_stock: MOCK_ITEMS.filter((i) => i.status === 'out_of_stock'),
  expiring: MOCK_ITEMS.filter((i) => i.status === 'expiring'),
  expired: MOCK_ITEMS.filter((i) => i.status === 'expired'),
};

export default function InventoryScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<InventoryTabStatus>('all');
  const { stock } = useInventory(activeTab);

  // Use real data if available, fall back to mock
  const displayItems = stock.data?.items ?? MOCK_BY_STATUS[activeTab];

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
});
