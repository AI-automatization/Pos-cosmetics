import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../../hooks/useDashboard';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import RevenueSummaryGrid from './RevenueSummaryGrid';
import SalesTrendChart from './SalesTrendChart';
import BranchComparisonChart from './BranchComparisonChart';
import TopProductsChart from './TopProductsChart';
import LowStockAlertList from './LowStockAlertList';
import { useBranchStore } from '../../store/branch.store';
import { DashboardStackParamList } from '../../navigation/types';
import { Colors, Radii, Shadows } from '../../config/theme';

type DashboardNavProp = NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<DashboardNavProp>();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const { revenue, orders, salesTrend, branchComparison, topProducts, lowStock } = useDashboard();

  const isLoading = revenue.isLoading || orders.isLoading;
  const isError = revenue.isError && orders.isError;

  const revenueData = revenue.data;
  const ordersData = orders.data;
  const lowStockData = lowStock.data ?? [];

  // lowStock banner first, then revenue cards, then finance links, then charts — matches Stitch layout
  const sections = [
    { key: 'lowStock' },
    { key: 'revenue' },
    { key: 'finance' },
    { key: 'reports' },
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
      case 'revenue':
        if (!revenueData) return null;
        return <RevenueSummaryGrid data={revenueData} orders={ordersData} />;
      case 'finance':
        return (
          <View style={styles.financeSection}>
            <Text style={styles.financeSectionTitle}>Moliya</Text>
            <View style={styles.financeRow}>
              <TouchableOpacity
                style={styles.financeCard}
                onPress={() => navigation.navigate('PnL')}
                activeOpacity={0.7}
              >
                <View style={[styles.financeIcon, { backgroundColor: Colors.successLight }]}>
                  <Ionicons name="analytics-outline" size={20} color={Colors.success} />
                </View>
                <Text style={styles.financeCardTitle}>Foyda va zarar</Text>
                <Text style={styles.financeCardSub}>P&L hisoboti</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.financeCard}
                onPress={() => navigation.navigate('DailyRevenue')}
                activeOpacity={0.7}
              >
                <View style={[styles.financeIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.financeCardTitle}>Kunlik daromad</Text>
                <Text style={styles.financeCardSub}>Har kungi tafsilot</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'reports':
        return (
          <View style={styles.financeSection}>
            <Text style={styles.financeSectionTitle}>Hisobotlar</Text>
            <View style={styles.financeRow}>
              <TouchableOpacity
                style={styles.financeCard}
                onPress={() => navigation.navigate('ShiftReport')}
                activeOpacity={0.7}
              >
                <View style={[styles.financeIcon, { backgroundColor: Colors.warningLight }]}>
                  <Ionicons name="time-outline" size={20} color={Colors.warning} />
                </View>
                <Text style={styles.financeCardTitle}>Smena hisoboti</Text>
                <Text style={styles.financeCardSub}>Kassa solishtirma</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.financeCard}
                onPress={() => navigation.navigate('BranchReport')}
                activeOpacity={0.7}
              >
                <View style={[styles.financeIcon, { backgroundColor: Colors.purpleLight }]}>
                  <Ionicons name="business-outline" size={20} color={Colors.purple} />
                </View>
                <Text style={styles.financeCardTitle}>Filial taqqoslash</Text>
                <Text style={styles.financeCardSub}>Daromad reytingi</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        );
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

  if (isError) {
    return (
      <ScreenLayout title={t('dashboard.title')} logoMode>
        <ErrorView
          error={revenue.error ?? orders.error}
          onRetry={() => { void handleRefresh(); }}
        />
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
  financeSection: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  financeSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  financeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  financeCard: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    ...Shadows.card,
  },
  financeIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  financeCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  financeCardSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
