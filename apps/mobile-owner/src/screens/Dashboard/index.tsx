import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../../hooks/useDashboard';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import RevenueSummaryGrid from './RevenueSummaryGrid';
import SalesTrendChart from './SalesTrendChart';
import BranchComparisonChart from './BranchComparisonChart';
import TopProductsChart from './TopProductsChart';
import LowStockAlertList from './LowStockAlertList';
import { useBranchStore } from '../../store/branch.store';
import { RevenueData, OrdersData } from '../../api/analytics.api';
import { InventoryItem } from '../../api/inventory.api';
import { DashboardStackParamList } from '../../navigation/types';
import { Colors, Radii } from '../../config/theme';

type DashboardNavProp = NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

// Mock low stock items to show the warning banner when backend is unavailable
const MOCK_LOW_STOCK: InventoryItem[] = [
  { id: 'm2', productName: 'Dior Sauvage EDT 60ml', barcode: '3348901419610', quantity: 3, unit: 'dona', branchName: 'Yunusabad', branchId: 'b2', costPrice: 285_000, stockValue: 855_000, reorderLevel: 5, expiryDate: '2026-08-15', status: 'low' },
  { id: 'm4', productName: 'MAC Lipstick Ruby Woo', barcode: '773602524723', quantity: 2, unit: 'dona', branchName: 'Sergeli', branchId: 'b4', costPrice: 180_000, stockValue: 360_000, reorderLevel: 5, expiryDate: null, status: 'low' },
  { id: 'm6', productName: "L'Oreal Paris Revitalift 30ml", barcode: '3600522861782', quantity: 1, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 95_000, stockValue: 95_000, reorderLevel: 3, expiryDate: '2026-04-01', status: 'expiring' },
];

// Mock data shown when backend is unavailable
const MOCK_REVENUE: RevenueData = {
  today: 18_750_000,
  todayTrend: 12.4,
  week: 124_500_000,
  weekTrend: 8.1,
  month: 487_200_000,
  monthTrend: 5.6,
  year: 2_340_000_000,
  yearTrend: 18.2,
};

const MOCK_ORDERS: OrdersData = {
  total: 247,
  avgOrderValue: 75_890,
  trend: 9.3,
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<DashboardNavProp>();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const { revenue, orders, salesTrend, branchComparison, topProducts, lowStock } = useDashboard();

  const isLoading = revenue.isLoading;

  // Use real data if available, fall back to mock
  const revenueData = revenue.data ?? MOCK_REVENUE;
  const ordersData = orders.data ?? MOCK_ORDERS;
  const lowStockData = lowStock.data && lowStock.data.length > 0 ? lowStock.data : MOCK_LOW_STOCK;

  // lowStock banner first, then revenue cards, then charts — matches Stitch layout
  const sections = [
    { key: 'lowStock' },
    { key: 'debts' },
    { key: 'revenue' },
    { key: 'salesTrend' },
    { key: 'branchComparison' },
    { key: 'topProducts' },
  ];

  function renderSection({ item }: { item: { key: string } }) {
    switch (item.key) {
      case 'lowStock':
        return (
          <LowStockAlertList
            data={lowStockData}
            onViewAll={() => navigation.navigate('Inventory')}
          />
        );
      case 'debts':
        return (
          <TouchableOpacity
            style={styles.debtBanner}
            onPress={() => navigation.navigate('Debts')}
            activeOpacity={0.8}
          >
            <View style={styles.debtLeft}>
              <Ionicons name="card-outline" size={16} color={Colors.danger} />
              <Text style={styles.debtText}>25 ta mijoz nasiyasi — 16.1M UZS</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.danger} />
          </TouchableOpacity>
        );
      case 'revenue':
        return <RevenueSummaryGrid data={revenueData} orders={ordersData} />;
      case 'salesTrend':
        return <SalesTrendChart data={salesTrend.data} />;
      case 'branchComparison':
        return selectedBranchId === null ? <BranchComparisonChart data={branchComparison.data} /> : null;
      case 'topProducts':
        return <TopProductsChart data={topProducts.data} />;
      default:
        return null;
    }
  }

  const handleRefresh = async () => {
    await Promise.all([
      revenue.refetch(),
      orders.refetch(),
      salesTrend.refetch(),
      branchComparison.refetch(),
      topProducts.refetch(),
      lowStock.refetch(),
    ]);
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('dashboard.title')} logoMode>
        <SkeletonList count={4} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('dashboard.title')} logoMode>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderSection}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={revenue.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8, paddingBottom: 32 },
  separator: { height: 8 },
  debtBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dangerLight,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  debtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debtText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
});
