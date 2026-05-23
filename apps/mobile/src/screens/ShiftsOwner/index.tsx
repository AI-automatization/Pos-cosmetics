import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShiftsOwnerStackParamList } from '../../navigation/types';
import ScreenLayout from '../../components/layout/ScreenLayout';
import ShiftList from './ShiftList';
import ShiftDetailScreen from './ShiftDetailScreen';
import { useShifts } from '../../hooks/useShifts';
import { Colors, Radii } from '../../config/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';

const Stack = createNativeStackNavigator<ShiftsOwnerStackParamList>();

function ShiftListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ShiftsOwnerStackParamList, 'ShiftList'>>();
  const [statusFilter, setStatusFilter] = React.useState<'open' | 'closed' | undefined>(undefined);
  const { shifts } = useShifts(statusFilter);

  const handlePressShift = React.useCallback((shiftId: string) => {
    navigation.navigate('ShiftDetail', { shiftId });
  }, [navigation]);

  const renderContent = () => {
    if (shifts.isLoading) {
      return <LoadingSpinner />;
    }

    if (shifts.isError) {
      return (
        <ErrorView
          error={shifts.error}
          onRetry={() => { void shifts.refetch(); }}
        />
      );
    }

    const items = shifts.data?.items ?? [];
    const displayData =
      statusFilter === undefined
        ? items
        : items.filter((s) => s.status === statusFilter);

    return (
      <ShiftList
        data={displayData}
        isRefreshing={shifts.isFetching}
        onRefresh={() => { void shifts.refetch(); }}
        onPressShift={handlePressShift}
      />
    );
  };

  return (
    <ScreenLayout title={t('shifts.title')} scrollable={false}>
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
      {renderContent()}
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
