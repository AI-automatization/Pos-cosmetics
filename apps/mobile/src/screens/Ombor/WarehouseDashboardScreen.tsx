// WarehouseDashboardScreen — Warehouse tab home: stats, quick nav, alerts, low stock, movements, restock, expiry
import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import type { OmborTabStackParamList } from '../../navigation/types';
import { useWarehouseDashboard } from './useWarehouseDashboard';
import { alertsApi, type Alert } from '../../api/alerts.api';
import type { DashboardLowStockItem, DashboardExpiryItem, DashboardMovement } from '../../api/inventory.api';
import { C } from './OmborColors';
import {
  StatCard,
  QuickChip,
  MovementRow,
  RestockCard,
  formatDate,
  formatUzbekDate,
} from './WarehouseDashboardParts';

type Nav = NativeStackNavigationProp<OmborTabStackParamList, 'WarehouseDashboard'>;

const MAX_LOW_STOCK = 5;
const MAX_MOVEMENTS = 10;

export default function WarehouseDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { dashboard, alerts, restockRequests } = useWarehouseDashboard();

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
    ]);
  }, [dashboard, alerts, restockRequests]);

  // Loading
  if (dashboard.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Ombor Dashboard</Text>
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Ombor Dashboard</Text>
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
          <StatCard title="Jami mahsulot" value={stats?.totalProducts ?? 0} icon="cube-outline" color={C.primary} />
          <StatCard title="Kam zaxira" value={stats?.lowStockCount ?? 0} icon="trending-down-outline" color={C.red} />
          <StatCard title="Muddati tugayotgan" value={stats?.expiryCount ?? 0} icon="calendar-outline" color={C.orange} />
          <StatCard
            title="Bugungi harakatlar"
            value={todayTotal}
            icon="swap-vertical-outline"
            color={C.green}
            subText={`\u2193 ${stats?.todayMovementsIn ?? 0} kirim \u00B7 \u2191 ${stats?.todayMovementsOut ?? 0} chiqim`}
          />
        </View>

        {/* Section 2: Quick Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} style={styles.chipScroll}>
          <QuickChip label="Zaxira holati" icon="list-outline" onPress={() => navigation.navigate('OmborMain')} />
          <QuickChip label="Nakladnoylar" icon="document-text-outline" onPress={() => navigation.navigate('InvoicesScreen')} />
          <QuickChip
            label="So'rovlar"
            icon="notifications-outline"
            onPress={() => navigation.navigate('RestockRequestsScreen')}
            badge={restockList.length}
          />
          <QuickChip label="Kirim" icon="add-circle-outline" onPress={() => navigation.navigate('OmborMain')} />
          <QuickChip label="Muddatlar" icon="time-outline" onPress={() => navigation.navigate('OmborMain')} />
          <QuickChip label="Harakatlar" icon="swap-horizontal-outline" onPress={() => navigation.navigate('OmborMain')} />
        </ScrollView>

        {/* Section 3: Expired Alert Banner */}
        {expiredCount > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning-outline" size={20} color={C.red} />
            <Text style={styles.alertBannerText}>
              {expiredCount} ta mahsulot muddati o{"'"}tgan!
            </Text>
          </View>
        )}

        {/* Section 4: Low Stock */}
        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kam zaxira</Text>
              <View style={styles.countBadgeRed}>
                <Text style={styles.countBadgeRedText}>{lowStockItems.length}</Text>
              </View>
            </View>
            {lowStockItems.slice(0, MAX_LOW_STOCK).map((item: DashboardLowStockItem) => (
              <View key={item.productId} style={styles.lowStockRow}>
                <Text style={styles.lowStockName} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.lowStockQty, { color: item.totalQty <= 0 ? C.red : C.orange }]}>
                  {item.totalQty} dona
                </Text>
              </View>
            ))}
            {lowStockItems.length > MAX_LOW_STOCK && (
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('OmborMain')} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>Barchasini ko{"'"}rish</Text>
                <Ionicons name="chevron-forward" size={14} color={C.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Section 5: Recent Movements */}
        {recentMovements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugungi harakatlar</Text>
            {recentMovements.slice(0, MAX_MOVEMENTS).map((mov: DashboardMovement) => (
              <MovementRow key={mov.id} item={mov} />
            ))}
          </View>
        )}

        {/* Section 6: Restock Requests */}
        {restockList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>To{"'"}ldirish so{"'"}rovlari</Text>
              <View style={styles.countBadgeBlue}>
                <Text style={styles.countBadgeBlueText}>{restockList.length}</Text>
              </View>
            </View>
            {restockList.map((item: Alert) => (
              <RestockCard
                key={item.id}
                item={item}
                onMarkRead={(id) => markRead.mutate(id)}
                isMarking={markRead.isPending && markRead.variables === item.id}
              />
            ))}
          </View>
        )}

        {/* Section 7: Expiry Items */}
        {expiryItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Muddati tugayotgan</Text>
            {expiryItems.map((item: DashboardExpiryItem) => (
              <View key={`${item.productId}-${item.batchNumber ?? item.expiryDate}`} style={styles.expiryCard}>
                <View style={styles.expiryLeftBorder} />
                <View style={styles.expiryContent}>
                  <Text style={styles.expiryName} numberOfLines={1}>{item.product.name}</Text>
                  <View style={styles.expiryMeta}>
                    <Text style={styles.expiryDateText}>{formatDate(item.expiryDate)}</Text>
                    {item.batchNumber ? (
                      <Text style={styles.expiryBatch}>Partiya: {item.batchNumber}</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.expiryQty}>{item.quantity} dona</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats 2x2
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },

  // Quick Nav Chips
  chipScroll: { marginTop: 16 },
  chipRow: { paddingHorizontal: 16, gap: 8 },

  // Alert Banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 10,
  },
  alertBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.red },

  // Section
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 },
  countBadgeRed: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    marginBottom: 8,
  },
  countBadgeRedText: { fontSize: 11, fontWeight: '700', color: C.red },
  countBadgeBlue: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    marginBottom: 8,
  },
  countBadgeBlueText: { fontSize: 11, fontWeight: '700', color: C.primary },

  // Low Stock
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  lowStockName: { flex: 1, fontSize: 13, fontWeight: '600', color: C.text, marginRight: 8 },
  lowStockQty: { fontSize: 13, fontWeight: '700' },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  seeAllText: { fontSize: 13, fontWeight: '600', color: C.primary },

  // Expiry cards
  expiryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  expiryLeftBorder: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: C.orange,
  },
  expiryContent: { flex: 1, padding: 12, gap: 2 },
  expiryName: { fontSize: 13, fontWeight: '600', color: C.text },
  expiryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expiryDateText: { fontSize: 11, color: C.orange, fontWeight: '600' },
  expiryBatch: { fontSize: 11, color: C.muted },
  expiryQty: { fontSize: 13, fontWeight: '700', color: C.text, paddingRight: 12 },
});
