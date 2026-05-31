import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DashboardStackParamList, TabParamList } from '../../navigation/types';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../../api/alerts.api';
import { useAuthStore } from '../../store/auth.store';
import { getRoleLevel } from '../../utils/roles';
import useDashboardData from './useDashboardData';
import DashboardHeader from './DashboardHeader';
import ShiftBanner from './ShiftBanner';
import MonthlyProfitCard from './MonthlyProfitCard';
import BranchRevenueCard from './BranchRevenueCard';
import WarehouseStatsGrid from './WarehouseStatsGrid';
import SalesStatsGrid from './SalesStatsGrid';
import RevenueCard from './RevenueCard';
import WeeklyTrendChart from './WeeklyTrendChart';
import TopProductsCard from './TopProductsCard';
import LowStockWidget from './LowStockWidget';
import ManagerKPICard from './ManagerKPICard';
import QuickAction from './QuickAction';
import { getActionsForRole } from './quickActions';
import { styles, PRIMARY } from './styles';

type DashboardNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavProp>();
  const { user } = useAuthStore();
  const isWarehouse = user?.role === 'WAREHOUSE';
  const isCashier = user?.role === 'CASHIER';
  const {
    todaySummary,
    weeklyRevenue,
    topProducts,
    currentShift,
    nasiyaSummary,
    lowStock,
    monthlyProfit,
    isMonthlyLoading,
    branchRevenue,
    isBranchRevenueLoading,
    isLoading,
    isRefreshing,
    refetchAll,
  } = useDashboardData(isWarehouse, isCashier);

  const isOwnerAdmin = getRoleLevel(user?.role) >= 4;
  const isManager = user?.role === 'MANAGER';

  // Badge — React Query bilan auto-refresh (30 soniya)
  const { data: activeAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts-active'],
    queryFn:  () => alertsApi.getActive(),
    refetchInterval: 30_000,
    staleTime:       20_000,
    retry:           false,
  });
  const unreadCount = (activeAlerts ?? []).filter((a) => !a.isRead).length;

  // Screen focus bo'lganda ham refresh
  useFocusEffect(
    React.useCallback(() => {
      void refetchAlerts();
    }, [refetchAlerts]),
  );

  const shift = currentShift.data ?? null;
  const summary = todaySummary.data;
  const weekly = weeklyRevenue.data ?? [];
  const products = topProducts.data ?? [];
  const lowStockItems = lowStock.data ?? [];

  // Quick actions — rolga qarab
  const quickActions = useMemo(
    () => getActionsForRole(user?.role, isOwnerAdmin),
    [user?.role, isOwnerAdmin],
  );

  const avgBasket =
    summary && summary.orders.count > 0
      ? summary.orders.grossRevenue / summary.orders.count
      : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <DashboardHeader
        unreadCount={unreadCount}
        onBellPress={() => navigation.navigate('NotificationsScreen')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetchAll}
            tintColor={PRIMARY}
          />
        }
      >
        {/* Smena banner — OWNER/ADMIN va WAREHOUSE uchun emas */}
        {!isOwnerAdmin && !isWarehouse && (
          <ShiftBanner shift={shift} onRefresh={refetchAll} />
        )}

        {/* Stats 2x2 grid */}
        {isWarehouse ? (
          <WarehouseStatsGrid />
        ) : isCashier ? (
          <SalesStatsGrid
            summary={summary}
            avgBasket={0}
            nasiyaOverdueCount={0}
            isCashier
          />
        ) : (
          <SalesStatsGrid
            summary={summary}
            avgBasket={avgBasket}
            nasiyaOverdueCount={nasiyaSummary.data?.overdueCount ?? 0}
          />
        )}

        {/* Manager KPI card — faqat MANAGER rol uchun */}
        {isManager && (
          <View style={styles.section}>
            <ManagerKPICard />
          </View>
        )}

        {/* Monthly profit — faqat OWNER/ADMIN uchun */}
        {isOwnerAdmin && (
          <View style={styles.section}>
            <MonthlyProfitCard
              revenue={monthlyProfit?.revenue ?? 0}
              cogs={monthlyProfit?.cogs ?? 0}
              grossProfit={monthlyProfit?.grossProfit ?? 0}
              totalExpenses={monthlyProfit?.totalExpenses ?? 0}
              netProfit={monthlyProfit?.netProfit ?? 0}
              loading={isMonthlyLoading}
            />
          </View>
        )}

        {/* Branch revenue — faqat OWNER/ADMIN uchun */}
        {isOwnerAdmin && (
          <View style={styles.section}>
            <BranchRevenueCard
              branches={(branchRevenue ?? []).map((b) => ({
                branchId:   b.branchId,
                branchName: b.branchName,
                revenue:    b.revenue,
                orders:     b.orders,
              }))}
              loading={isBranchRevenueLoading}
            />
          </View>
        )}

        {/* Weekly chart — CASHIER va WAREHOUSE ko'rmaydi */}
        {!isWarehouse && !isCashier && (
          <View style={styles.section}>
            <WeeklyTrendChart data={weekly} />
          </View>
        )}

        {/* Revenue card — CASHIER va WAREHOUSE ko'rmaydi */}
        {summary !== undefined && !isWarehouse && !isCashier && (
          <View style={styles.section}>
            <RevenueCard summary={summary} />
          </View>
        )}

        {/* Top products — CASHIER va WAREHOUSE ko'rmaydi */}
        {products.length > 0 && !isWarehouse && !isCashier && (
          <View style={styles.section}>
            <TopProductsCard products={products} />
          </View>
        )}

        {/* Low stock warning */}
        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <LowStockWidget
              items={lowStockItems}
              onViewAll={() => navigation.navigate('Koproq' as keyof TabParamList, { screen: 'LowStockList' } as never)}
            />
          </View>
        )}

        {/* Quick Actions 2x2 grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tez harakatlar</Text>
          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <QuickAction
                key={action.route + action.label}
                icon={action.icon}
                label={action.label}
                color={action.color}
                bg={action.bg}
                onPress={() =>
                  action.routeParams
                    ? navigation.navigate(action.route as keyof TabParamList, action.routeParams as never)
                    : navigation.navigate(action.route as keyof TabParamList)
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}
