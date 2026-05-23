import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DashboardStackParamList, TabParamList } from '../../navigation/types';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../../api/alerts.api';
import useDashboardData from './useDashboardData';
import ActiveShiftCard from './ActiveShiftCard';
import MonthlyProfitCard from './MonthlyProfitCard';
import BranchRevenueCard from './BranchRevenueCard';
import WarehouseStatsGrid from './WarehouseStatsGrid';
import SalesStatsGrid from './SalesStatsGrid';
import RevenueCard from './RevenueCard';
import WeeklyTrendChart from './WeeklyTrendChart';
import TopProductsCard from './TopProductsCard';
import LowStockWidget from './LowStockWidget';
import ManagerKPICard from './ManagerKPICard';
import { useShiftStore } from '../../store/shiftStore';
import SmenaOpenSheet from '../Smena/SmenaOpenSheet';
import SmenaCloseSheet from '../Smena/SmenaCloseSheet';
import { useAuthStore } from '../../store/auth.store';
import { getRoleLevel } from '../../utils/roles';
import QuickAction from './QuickAction';
import { getActionsForRole } from './quickActions';
import { styles, PRIMARY } from './styles';

type DashboardNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

function formatUzbekDate(): string {
  const now = new Date();
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
  ];
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  return `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}, ${days[now.getDay()]}`;
}

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
  const { openShift, closeShift, syncWithApi } = useShiftStore();
  const [loading, setLoading] = useState(false);
  const [openSheetVisible, setOpenSheetVisible] = useState(false);
  const [closeSheetVisible, setCloseSheetVisible] = useState(false);

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

  const handleOpenConfirm = useCallback((openingCash: number) => {
    setLoading(true);
    openShift(openingCash)
      .then(() => {
        setOpenSheetVisible(false);
        Alert.alert('Tayyor', 'Smena muvaffaqiyatli ochildi');
        refetchAll();
      })
      .catch((err: unknown) => {
        let msg = 'Smena ochishda xatolik';
        if (err && typeof err === 'object' && 'response' in err) {
          const resp = (err as { response?: { data?: { message?: string | string[]; error?: { message?: string } } } }).response;
          const serverMsg = resp?.data?.error?.message ?? resp?.data?.message;
          if (serverMsg) {
            msg = Array.isArray(serverMsg) ? serverMsg.join('\n') : String(serverMsg);
            if (msg.includes('already has an open shift')) {
              msg = 'Sizda allaqachon ochiq smena mavjud';
              void syncWithApi();
            }
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        Alert.alert('Xatolik', msg);
      })
      .finally(() => setLoading(false));
  }, [openShift, refetchAll, syncWithApi]);

  const handleCloseConfirm = useCallback(async (actualCash: number) => {
    setLoading(true);
    try {
      await closeShift(actualCash);
      setCloseSheetVisible(false);
      Alert.alert('Tayyor', 'Smena muvaffaqiyatli yopildi');
      refetchAll();
    } catch {
      Alert.alert('Xatolik', 'Smena yopishda xatolik');
    } finally {
      setLoading(false);
    }
  }, [closeShift, refetchAll]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  const avgBasket =
    summary && summary.orders.count > 0
      ? summary.orders.grossRevenue / summary.orders.count
      : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bosh sahifa</Text>
          <Text style={styles.headerDate}>{formatUzbekDate()}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('NotificationsScreen')}
        >
          <Ionicons name="notifications-outline" size={24} color="#374151" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : String(unreadCount)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
        {/* Smena banner yoki ActiveShiftCard — OWNER/ADMIN uchun emas */}
        {!isOwnerAdmin && !isWarehouse && (!shift ? (
          <View style={styles.smenaBanner}>
            <View style={styles.smenaBannerLeft}>
              <Ionicons name="time-outline" size={20} color="#D97706" />
              <Text style={styles.smenaBannerText}>Smena ochilmagan</Text>
            </View>
            <TouchableOpacity
              style={styles.smenaOpenBtn}
              activeOpacity={0.85}
              onPress={() => setOpenSheetVisible(true)}
            >
              <Text style={styles.smenaOpenBtnText}>Smena ochish</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.section}
            onPress={() => setCloseSheetVisible(true)}
            activeOpacity={0.85}
          >
            <ActiveShiftCard shift={shift} />
          </TouchableOpacity>
        ))}

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
              onViewAll={() => navigation.navigate('Koproq', { screen: 'LowStockList' } as any)}
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
                    ? navigation.navigate(action.route as any, action.routeParams as any)
                    : navigation.navigate(action.route as any)
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      <SmenaOpenSheet
        visible={openSheetVisible}
        loading={loading}
        onClose={() => setOpenSheetVisible(false)}
        onConfirm={handleOpenConfirm}
      />
      <SmenaCloseSheet
        visible={closeSheetVisible}
        loading={loading}
        shift={shift}
        onClose={() => setCloseSheetVisible(false)}
        onConfirm={handleCloseConfirm}
      />
    </SafeAreaView>
  );
}
