import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDashboardData } from './useDashboardData';
import ActiveShiftCard from './ActiveShiftCard';
import RevenueCard from './RevenueCard';
import WeeklyTrendChart from './WeeklyTrendChart';
import TopProductsCard from './TopProductsCard';
import StatCard from '../../components/common/StatCard';
import { formatCompact } from '../../utils/currency';
import { useShiftStore } from '../../store/shiftStore';
import SmenaOpenSheet from '../Smena/SmenaOpenSheet';
import SmenaCloseSheet from '../Smena/SmenaCloseSheet';

const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#EFF6FF';

function formatUzbekDate(): string {
  const now = new Date();
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
  ];
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  return `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}, ${days[now.getDay()]}`;
}

interface QuickActionProps {
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly label: string;
  readonly color: string;
  readonly bg: string;
  readonly onPress: () => void;
}

function QuickAction({ icon, label, color, bg, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const {
    todaySummary,
    weeklyRevenue,
    topProducts,
    currentShift,
    nasiyaSummary,
    isLoading,
    isRefreshing,
    refetchAll,
  } = useDashboardData();

  const { openShift, closeShift } = useShiftStore();
  const [loading, setLoading] = useState(false);
  const [openSheetVisible, setOpenSheetVisible] = useState(false);
  const [closeSheetVisible, setCloseSheetVisible] = useState(false);

  const shift = currentShift.data ?? null;
  const summary = todaySummary.data;
  const weekly = weeklyRevenue.data ?? [];
  const products = topProducts.data ?? [];

  const handleOpenConfirm = (openingCash: number) => {
    setLoading(true);
    openShift(openingCash)
      .then(() => {
        setOpenSheetVisible(false);
        Alert.alert('Tayyor', 'Smena muvaffaqiyatli ochildi');
        refetchAll();
      })
      .catch(() => Alert.alert('Xatolik', 'Smena ochishda xatolik'))
      .finally(() => setLoading(false));
  };

  const handleCloseConfirm = async (actualCash: number) => {
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
  };

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
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
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
        {/* Smena banner yoki ActiveShiftCard */}
        {!shift ? (
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
        )}

        {/* Stats 2x2 grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              style={styles.statCard}
              icon={<Ionicons name="receipt-outline" size={20} color="#2563EB" />}
              iconBg={PRIMARY_LIGHT}
              title="Buyurtmalar"
              value={String(summary?.orders.count ?? 0)}
              subtitle="bugun"
            />
            <StatCard
              style={styles.statCard}
              icon={<Ionicons name="trending-up-outline" size={20} color="#16A34A" />}
              iconBg="#F0FDF4"
              title="Daromad"
              value={summary ? formatCompact(summary.netRevenue) : '0'}
              subtitle="bugun"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              style={styles.statCard}
              icon={<Ionicons name="cart-outline" size={20} color="#D97706" />}
              iconBg="#FFFBEB"
              title="O'rtacha chek"
              value={formatCompact(avgBasket)}
              subtitle="so'm"
            />
            <StatCard
              style={styles.statCard}
              icon={<Ionicons name="wallet-outline" size={20} color="#7C3AED" />}
              iconBg="#F5F3FF"
              title="Nasiya"
              value={String(nasiyaSummary.data?.overdueCount ?? 0)}
              subtitle="muddati o'tgan"
            />
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.section}>
          <WeeklyTrendChart data={weekly} />
        </View>

        {/* Revenue card */}
        {summary !== undefined && (
          <View style={styles.section}>
            <RevenueCard summary={summary} />
          </View>
        )}

        {/* Top products */}
        {products.length > 0 && (
          <View style={styles.section}>
            <TopProductsCard products={products} />
          </View>
        )}

        {/* Quick Actions 2x2 grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tez harakatlar</Text>
          <View style={styles.quickGrid}>
            <QuickAction
              icon="cart-outline"
              label="Savdo"
              color="#2563EB"
              bg="#EFF6FF"
              onPress={() => navigation.navigate('Savdo')}
            />
            <QuickAction
              icon="arrow-down-circle-outline"
              label="Kirim"
              color="#16A34A"
              bg="#F0FDF4"
              onPress={() => navigation.navigate('Koproq')}
            />
            <QuickAction
              icon="grid-outline"
              label="Katalog"
              color="#D97706"
              bg="#FFFBEB"
              onPress={() => navigation.navigate('Katalog')}
            />
            <QuickAction
              icon="bar-chart-outline"
              label="Hisobot"
              color="#7C3AED"
              bg="#F5F3FF"
              onPress={() => navigation.navigate('Moliya')}
            />
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 24,
  },

  // Smena banner
  smenaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  smenaBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smenaBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  smenaOpenBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smenaOpenBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },

  // Stats grid
  statsGrid: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },

  // Quick actions
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  bottomPad: {
    height: 16,
  },
});
