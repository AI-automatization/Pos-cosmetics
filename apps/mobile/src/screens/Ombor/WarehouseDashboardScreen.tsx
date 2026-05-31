// WarehouseDashboardScreen — Warehouse tab home: stats, quick nav, alerts, low stock, movements, restock, expiry
import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { OmborTabStackParamList } from '../../navigation/types';
import { useWarehouseDashboard } from './useWarehouseDashboard';
import { alertsApi } from '../../api/alerts.api';
import { C } from './OmborColors';
import { StatCard, QuickChip, formatUzbekDate } from './WarehouseDashboardParts';
import {
  AlertBanner,
  LowStockSection,
  MovementsSection,
  RestockSection,
  ExpirySection,
} from './WarehouseDashboardSections';
import { styles } from './WarehouseDashboardScreen.styles';

type Nav = NativeStackNavigationProp<OmborTabStackParamList, 'WarehouseDashboard'>;

const MAX_LOW_STOCK = 5;
const MAX_MOVEMENTS = 10;

export default function WarehouseDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { dashboard, alerts, restockRequests, transferRequests } = useWarehouseDashboard();

  // Vibrate on new restock requests
  const prevCountRef = useRef(0);
  useEffect(() => {
    const count = restockRequests.data?.length ?? 0;
    if (count > prevCountRef.current && prevCountRef.current > 0) {
      Vibration.vibrate(200);
    }
    prevCountRef.current = count;
  }, [restockRequests.data?.length]);

  // Mark restock as read
  const markRead = useMutation({
    mutationFn: (id: string) => alertsApi.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['restock-requests'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts-active'] });
    },
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      dashboard.refetch(),
      alerts.refetch(),
      restockRequests.refetch(),
      transferRequests.refetch(),
    ]);
  }, [dashboard, alerts, restockRequests, transferRequests]);

  // Loading
  if (dashboard.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('warehouse.dashboard')}</Text>
            <Text style={styles.headerSub}>{formatUzbekDate()}</Text>
          </View>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const stats = dashboard.data?.stats;
  const lowStockItems = dashboard.data?.lowStockItems ?? [];
  const expiryItems = dashboard.data?.expiryItems ?? [];
  const recentMovements = dashboard.data?.recentMovements ?? [];
  const expiredCount = alerts.data?.expired ?? 0;
  const restockList = restockRequests.data ?? [];
  const todayTotal = (stats?.todayMovementsIn ?? 0) + (stats?.todayMovementsOut ?? 0);
  const transferRequestCount = transferRequests.data?.items?.length ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t('warehouse.dashboard')}</Text>
          <Text style={styles.headerSub}>{formatUzbekDate()}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => { void handleRefresh(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
      >
        {/* Section 1: Stats 2x2 */}
        <View style={styles.statsGrid}>
          <StatCard title={t('warehouse.totalProducts')} value={stats?.totalProducts ?? 0} icon="cube-outline" color={C.primary} />
          <StatCard title={t('warehouse.lowStock')} value={stats?.lowStockCount ?? 0} icon="trending-down-outline" color={C.red} />
          <StatCard title={t('warehouse.expiringSoon')} value={stats?.expiryCount ?? 0} icon="calendar-outline" color={C.orange} />
          <StatCard
            title={t('warehouse.todayMovements')}
            value={todayTotal}
            icon="swap-vertical-outline"
            color={C.green}
            subText={`\u2193 ${stats?.todayMovementsIn ?? 0} ${t('warehouse.incoming')} \u00B7 \u2191 ${stats?.todayMovementsOut ?? 0} ${t('warehouse.outgoing')}`}
          />
        </View>

        {/* Section 2: Quick Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} style={styles.chipScroll}>
          <QuickChip label={t('warehouse.stockStatus')} icon="list-outline" onPress={() => navigation.navigate('OmborMain')} />
          <QuickChip label={t('warehouse.invoices')} icon="document-text-outline" onPress={() => navigation.navigate('InvoicesScreen')} />
          <QuickChip
            label={t('warehouse.requests')}
            icon="notifications-outline"
            onPress={() => navigation.navigate('RestockRequestsScreen')}
            badge={restockList.length}
          />
          <QuickChip
            label={t('warehouse.transfers')}
            icon="swap-horizontal-outline"
            onPress={() => navigation.navigate('TransferListScreen')}
            badge={transferRequestCount}
          />
          <QuickChip label={t('warehouse.receipt')} icon="add-circle-outline" onPress={() => navigation.navigate('OmborMain')} />
          <QuickChip label={t('warehouse.expiryDates')} icon="time-outline" onPress={() => navigation.navigate('OmborMain')} />
          <QuickChip label={t('warehouse.movements')} icon="swap-horizontal-outline" onPress={() => navigation.navigate('OmborMain')} />
        </ScrollView>

        {/* Section 3: Expired Alert Banner */}
        <AlertBanner expiredCount={expiredCount} />

        {/* Section 4: Low Stock */}
        <LowStockSection
          items={lowStockItems}
          maxItems={MAX_LOW_STOCK}
          onSeeAll={() => navigation.navigate('OmborMain')}
        />

        {/* Section 5: Recent Movements */}
        <MovementsSection items={recentMovements} maxItems={MAX_MOVEMENTS} />

        {/* Section 6: Restock Requests */}
        <RestockSection
          items={restockList}
          onMarkRead={(id) => markRead.mutate(id)}
          markingId={markRead.variables}
          isMarking={markRead.isPending}
        />

        {/* Section 7: Expiry Items */}
        <ExpirySection items={expiryItems} />
      </ScrollView>
    </SafeAreaView>
  );
}
