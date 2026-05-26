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
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import EmployeeList from './EmployeeList';
import SuspiciousActivityList from './SuspiciousActivityList';
import { useEmployees } from '../../hooks/useEmployees';
import { Period } from '../../hooks/usePeriodFilter';
import { Colors, Radii, Shadows } from '../../config/theme';
import { EmployeePerformance } from '../../api/employees.api';
import { EmployeesStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<EmployeesStackParamList, 'EmployeeList'>;

const PERIODS: Period[] = ['today', 'week', 'month', 'year'];

export default function EmployeesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [period, setPeriod] = React.useState<Period>('month');
  const { performance, suspicious } = useEmployees(period);

  const performanceData = performance.data ?? [];
  const suspiciousData = suspicious.data ?? [];

  const handleRefresh = async () => {
    await Promise.all([performance.refetch(), suspicious.refetch()]);
  };

  const handlePressEmployee = (item: EmployeePerformance) => {
    navigation.navigate('EmployeeDetail', {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
    });
  };

  if (performance.isLoading) {
    return (
      <ScreenLayout title={t('employees.title')}>
        <SkeletonList count={4} />
      </ScreenLayout>
    );
  }

  if (performance.isError && suspicious.isError) {
    return (
      <ScreenLayout title={t('employees.title')}>
        <ErrorView
          error={performance.error ?? suspicious.error}
          onRetry={() => { void handleRefresh(); }}
        />
      </ScreenLayout>
    );
  }

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
