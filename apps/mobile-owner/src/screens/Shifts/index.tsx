import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShiftsStackParamList } from '../../navigation/types';
import ScreenLayout from '../../components/layout/ScreenLayout';
import ShiftList from './ShiftList';
import ShiftDetailScreen from './ShiftDetailScreen';
import { useShifts } from '../../hooks/useShifts';
import { Shift } from '../../api/shifts.api';
import { Colors, Radii } from '../../config/theme';

const Stack = createNativeStackNavigator<ShiftsStackParamList>();

const MOCK_SHIFTS: Shift[] = [
  {
    id: 's1',
    branchId: 'b1',
    branchName: 'Chilonzor',
    cashierId: 'e1',
    cashierName: 'Sarvar Qodirov',
    openedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    closedAt: null,
    status: 'open',
    totalRevenue: 8_450_000,
    totalOrders: 34,
    avgOrderValue: 248_529,
    totalRefunds: 1,
    totalVoids: 0,
    totalDiscounts: 3,
    paymentBreakdown: [
      { method: 'cash', amount: 3_200_000, percentage: 37.9 },
      { method: 'terminal', amount: 2_850_000, percentage: 33.7 },
      { method: 'click', amount: 1_550_000, percentage: 18.3 },
      { method: 'payme', amount: 850_000, percentage: 10.1 },
    ],
  },
  {
    id: 's2',
    branchId: 'b2',
    branchName: 'Yunusabad',
    cashierId: 'e3',
    cashierName: 'Jahongir Nazarov',
    openedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    closedAt: null,
    status: 'open',
    totalRevenue: 5_120_000,
    totalOrders: 21,
    avgOrderValue: 243_809,
    totalRefunds: 0,
    totalVoids: 1,
    totalDiscounts: 2,
    paymentBreakdown: [
      { method: 'cash', amount: 2_100_000, percentage: 41.0 },
      { method: 'terminal', amount: 1_900_000, percentage: 37.1 },
      { method: 'click', amount: 1_120_000, percentage: 21.9 },
    ],
  },
  {
    id: 's3',
    branchId: 'b1',
    branchName: 'Chilonzor',
    cashierId: 'e2',
    cashierName: 'Muhabbat Tosheva',
    openedAt: new Date(Date.now() - 28 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 12_780_000,
    totalOrders: 58,
    avgOrderValue: 220_345,
    totalRefunds: 3,
    totalVoids: 1,
    totalDiscounts: 7,
    paymentBreakdown: [
      { method: 'cash', amount: 5_200_000, percentage: 40.7 },
      { method: 'terminal', amount: 4_380_000, percentage: 34.3 },
      { method: 'click', amount: 1_900_000, percentage: 14.9 },
      { method: 'payme', amount: 1_300_000, percentage: 10.2 },
    ],
  },
  {
    id: 's4',
    branchId: 'b3',
    branchName: "Mirzo Ulug'bek",
    cashierId: 'e4',
    cashierName: 'Zulfiya Ergasheva',
    openedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 9_340_000,
    totalOrders: 42,
    avgOrderValue: 222_381,
    totalRefunds: 2,
    totalVoids: 0,
    totalDiscounts: 5,
    paymentBreakdown: [
      { method: 'cash', amount: 3_800_000, percentage: 40.7 },
      { method: 'terminal', amount: 3_100_000, percentage: 33.2 },
      { method: 'click', amount: 1_540_000, percentage: 16.5 },
      { method: 'payme', amount: 900_000, percentage: 9.6 },
    ],
  },
  {
    id: 's5',
    branchId: 'b4',
    branchName: 'Sergeli',
    cashierId: 'e1',
    cashierName: 'Sarvar Qodirov',
    openedAt: new Date(Date.now() - 52 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 44 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 6_890_000,
    totalOrders: 31,
    avgOrderValue: 222_258,
    totalRefunds: 1,
    totalVoids: 0,
    totalDiscounts: 4,
    paymentBreakdown: [
      { method: 'cash', amount: 2_900_000, percentage: 42.1 },
      { method: 'terminal', amount: 2_400_000, percentage: 34.8 },
      { method: 'click', amount: 1_590_000, percentage: 23.1 },
    ],
  },
];

function ShiftListScreen() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = React.useState<'open' | 'closed' | undefined>(undefined);
  const { shifts } = useShifts(statusFilter);

  const allData = shifts.data?.items && shifts.data.items.length > 0 ? shifts.data.items : MOCK_SHIFTS;
  const displayData =
    statusFilter === undefined
      ? allData
      : allData.filter((s) => s.status === statusFilter);

  return (
    <ScreenLayout title={t('shifts.title')}>
      <View style={styles.filters}>
        {([undefined, 'open', 'closed'] as const).map((s) => (
          <TouchableOpacity
            key={String(s)}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>
              {s === undefined ? t('alerts.all') : s === 'open' ? t('shifts.open') : t('shifts.closed')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ShiftList
        data={displayData}
        isRefreshing={shifts.isFetching}
        onRefresh={() => { void shifts.refetch(); }}
        onPressShift={() => undefined}
      />
    </ScreenLayout>
  );
}

export default function ShiftsScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShiftList" component={ShiftListScreen} />
      <Stack.Screen name="ShiftDetail" component={ShiftDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle,
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.textWhite },
});
