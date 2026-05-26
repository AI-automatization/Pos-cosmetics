import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShiftsStackParamList } from '../../navigation/types';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import ShiftList from './ShiftList';
import ShiftDetailScreen from './ShiftDetailScreen';
import { useShifts } from '../../hooks/useShifts';
import { Colors, Radii } from '../../config/theme';

const Stack = createNativeStackNavigator<ShiftsStackParamList>();

function ShiftListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ShiftsStackParamList, 'ShiftList'>>();
  const [statusFilter, setStatusFilter] = React.useState<'open' | 'closed' | undefined>(undefined);
  const { shifts } = useShifts(statusFilter);

  const allData = shifts.data?.items ?? [];
  const displayData =
    statusFilter === undefined
      ? allData
      : allData.filter((s) => s.status === statusFilter);

  if (shifts.isLoading) {
    return (
      <ScreenLayout title={t('shifts.title')}>
        <SkeletonList count={4} />
      </ScreenLayout>
    );
  }

  if (shifts.isError) {
    return (
      <ScreenLayout title={t('shifts.title')}>
        <ErrorView error={shifts.error} onRetry={() => { void shifts.refetch(); }} />
      </ScreenLayout>
    );
  }

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
        onPressShift={(shiftId: string) => navigation.navigate('ShiftDetail', { shiftId })}
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
