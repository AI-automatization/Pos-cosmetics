import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radii } from '../../config/theme';
import ScreenLayout from '../../components/layout/ScreenLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import SalesOrderList from './SalesOrderList';
import SalesOrderDetailScreen from './SalesOrderDetailScreen';
import { useSalesOrdersData } from './useSalesOrdersData';
import type { OrderStatus } from '@raos/types';
import type { SalesOrdersStackParamList } from '../../navigation/types';

export type { SalesOrdersStackParamList };

const Stack = createNativeStackNavigator<SalesOrdersStackParamList>();

type StatusFilter = OrderStatus | undefined;

const FILTER_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: undefined,    label: 'Barchasi' },
  { key: 'COMPLETED', label: 'Bajarilgan' },
  { key: 'RETURNED',  label: 'Qaytarilgan' },
  { key: 'VOIDED',    label: 'Bekor' },
];

type ListNavProp = NativeStackNavigationProp<SalesOrdersStackParamList, 'SalesOrderList'>;

function SalesOrderListScreen(_props: NativeStackScreenProps<SalesOrdersStackParamList, 'SalesOrderList'>) {
  const navigation = useNavigation<ListNavProp>();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(undefined);
  const { orders } = useSalesOrdersData();

  const handlePress = React.useCallback(
    (orderId: string, orderNumber: number) => {
      navigation.navigate('SalesOrderDetail', { orderId, orderNumber });
    },
    [navigation],
  );

  const filteredData = React.useMemo(() => {
    const all = orders.data ?? [];
    if (statusFilter === undefined) return all;
    return all.filter((o) => o.status === statusFilter);
  }, [orders.data, statusFilter]);

  const renderContent = () => {
    if (orders.isLoading) return <LoadingSpinner />;

    if (orders.isError) {
      return (
        <ErrorView
          error={orders.error}
          onRetry={() => { void orders.refetch(); }}
        />
      );
    }

    return (
      <SalesOrderList
        data={filteredData}
        isRefreshing={orders.isFetching}
        onRefresh={() => { void orders.refetch(); }}
        onPress={handlePress}
      />
    );
  };

  return (
    <ScreenLayout title="Buyurtmalar" scrollable={false}>
      <View style={styles.filters}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={String(opt.key)}
            style={[
              styles.filterBtn,
              statusFilter === opt.key && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: statusFilter === opt.key }}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === opt.key && styles.filterTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderContent()}
    </ScreenLayout>
  );
}

export default function SalesOrdersScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SalesOrderList" component={SalesOrderListScreen} />
      <Stack.Screen name="SalesOrderDetail" component={SalesOrderDetailScreen} />
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textWhite,
  },
});
