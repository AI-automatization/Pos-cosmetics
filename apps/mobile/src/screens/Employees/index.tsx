import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../../components/layout/ScreenLayout';
import EmployeeList from './EmployeeList';
import SuspiciousActivityList from './SuspiciousActivityList';
import { useEmployees } from '../../hooks/useEmployees';
import { Period } from '../../hooks/usePeriodFilter';
import { Colors, Radii, Shadows } from '../../config/theme';
import { EmployeePerformance, SuspiciousActivityAlert } from '../../api/employees.api';
import { EmployeesStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<EmployeesStackParamList, 'EmployeeList'>;

const PERIODS: Period[] = ['today', 'week', 'month', 'year'];

const MOCK_EMPLOYEES: EmployeePerformance[] = [
  {
    employeeId: 'e1', employeeName: 'Sarvar Qodirov', role: 'Kassir', branchName: 'Chilonzor',
    totalOrders: 142, totalRevenue: 18_540_000, avgOrderValue: 130_563,
    totalRefunds: 4, refundRate: 2.8, totalVoids: 1, totalDiscounts: 8, discountRate: 5.6,
    suspiciousActivityCount: 1,
    alerts: [{ id: 'a1', type: 'LARGE_DISCOUNT', description: '35% chegirma berildi', occurredAt: '2026-03-11T14:22:00Z', severity: 'medium' }],
  },
  {
    employeeId: 'e2', employeeName: 'Muhabbat Tosheva', role: 'Kassir', branchName: 'Yunusabad',
    totalOrders: 98, totalRevenue: 12_100_000, avgOrderValue: 123_469,
    totalRefunds: 1, refundRate: 1.0, totalVoids: 0, totalDiscounts: 3, discountRate: 3.1,
    suspiciousActivityCount: 0, alerts: [],
  },
  {
    employeeId: 'e3', employeeName: 'Jahongir Nazarov', role: 'Kassir', branchName: "Mirzo Ulug'bek",
    totalOrders: 76, totalRevenue: 9_450_000, avgOrderValue: 124_342,
    totalRefunds: 6, refundRate: 7.9, totalVoids: 3, totalDiscounts: 2, discountRate: 2.6,
    suspiciousActivityCount: 2,
    alerts: [
      { id: 'a2', type: 'RAPID_REFUNDS', description: "6 ta qaytarish — yuqori ko'rsatkich", occurredAt: '2026-03-10T10:00:00Z', severity: 'high' },
      { id: 'a3', type: 'EXCESSIVE_VOIDS', description: "3 ta to'lov bekor qilindi", occurredAt: '2026-03-09T16:45:00Z', severity: 'medium' },
    ],
  },
  {
    employeeId: 'e4', employeeName: 'Zulfiya Ergasheva', role: 'Kassir', branchName: 'Sergeli',
    totalOrders: 54, totalRevenue: 6_230_000, avgOrderValue: 115_370,
    totalRefunds: 0, refundRate: 0, totalVoids: 0, totalDiscounts: 5, discountRate: 9.3,
    suspiciousActivityCount: 0, alerts: [],
  },
];

const MOCK_SUSPICIOUS: SuspiciousActivityAlert[] = [
  { id: 's1', type: 'RAPID_REFUNDS', description: "Jahongir Nazarov — 6 ta qaytarish (30 daqiqada)", occurredAt: '2026-03-10T10:00:00Z', severity: 'high' },
  { id: 's2', type: 'LARGE_DISCOUNT', description: "Sarvar Qodirov — 35% chegirma (ruxsat etilgan: 20%)", occurredAt: '2026-03-11T14:22:00Z', severity: 'medium' },
  { id: 's3', type: 'EXCESSIVE_VOIDS', description: "Jahongir Nazarov — 3 ta to'lov bekor qilindi", occurredAt: '2026-03-09T16:45:00Z', severity: 'medium' },
];

export default function EmployeesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [period, setPeriod] = React.useState<Period>('month');
  const { performance, suspicious } = useEmployees(period);

  const performanceData = performance.data && performance.data.length > 0 ? performance.data : MOCK_EMPLOYEES;
  const suspiciousData = suspicious.data && suspicious.data.length > 0 ? suspicious.data : MOCK_SUSPICIOUS;

  const handleRefresh = async () => {
    await Promise.all([performance.refetch(), suspicious.refetch()]);
  };

  const handlePressEmployee = (item: EmployeePerformance) => {
    navigation.navigate('EmployeeDetail', {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
    });
  };

  return (
    <ScreenLayout
      title={t('employees.title')}
      rightAction={
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEmployee')}>
          <Ionicons name="add" size={20} color={Colors.textWhite} />
          <Text style={styles.addBtnText}>{t('employees.add')}</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.tab, period === p && styles.tabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
              {t(`common.${p}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={performance.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
      >
        <EmployeeList
          data={performanceData}
          isRefreshing={false}
          onRefresh={() => { void performance.refetch(); }}
          onPressEmployee={handlePressEmployee}
        />
        <SuspiciousActivityList data={suspiciousData} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.md,
    ...Shadows.card,
  },
  addBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
});
