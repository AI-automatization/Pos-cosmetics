import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows } from '../../config/theme';
import ScreenLayout from '../../components/layout/ScreenLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import SalesOrderList from './SalesOrderList';
import SalesOrderDetailScreen from './SalesOrderDetailScreen';
import { useSalesOrdersData } from './useSalesOrdersData';
import type { Period } from './useSalesOrdersData';
import type { OrderStatus } from '@raos/types';
import type { SalesOrdersStackParamList } from '../../navigation/types';

export type { SalesOrdersStackParamList };

const Stack = createNativeStackNavigator<SalesOrdersStackParamList>();

type StatusFilter = OrderStatus | undefined;

const PERIOD_OPTIONS: Array<{ key: Period; label: string }> = [
  { key: 'today', label: 'Bugun' },
  { key: '7d',    label: '7 kun' },
  { key: '30d',   label: '30 kun' },
  { key: 'all',   label: 'Hammasi' },
];

const STATUS_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: undefined,    label: 'Barchasi' },
  { key: 'COMPLETED',  label: 'Bajarilgan' },
  { key: 'RETURNED',   label: 'Qaytarilgan' },
  { key: 'VOIDED',     label: 'Bekor' },
];

type ListNavProp = NativeStackNavigationProp<SalesOrdersStackParamList, 'SalesOrderList'>;

function SalesOrderListScreen(
  _props: NativeStackScreenProps<SalesOrdersStackParamList, 'SalesOrderList'>,
) {
  const navigation = useNavigation<ListNavProp>();

  const [period, setPeriod] = React.useState<Period>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(undefined);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { orders } = useSalesOrdersData(period);

  const handlePress = React.useCallback(
    (orderId: string, orderNumber: number) => {
      navigation.navigate('SalesOrderDetail', { orderId, orderNumber });
    },
    [navigation],
  );

  const statusFiltered = React.useMemo(() => {
    const all = orders.data ?? [];
    if (statusFilter === undefined) return all;
    return all.filter((o) => o.status === statusFilter);
  }, [orders.data, statusFilter]);

  const filteredData = React.useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return statusFiltered;
    return statusFiltered.filter((o) =>
      String(o.orderNumber).includes(q),
    );
  }, [statusFiltered, searchQuery]);

  const totalCount = filteredData.length;

  const totalRevenue = React.useMemo(
    () => filteredData.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
    [filteredData],
  );

  const formattedRevenue = React.useMemo(
    () => totalRevenue.toLocaleString('uz-UZ') + " so'm",
    [totalRevenue],
  );

  if (orders.isLoading) {
    return (
      <ScreenLayout title="Buyurtmalar" scrollable={false}>
        <LoadingSpinner />
      </ScreenLayout>
    );
  }

  if (orders.isError) {
    return (
      <ScreenLayout title="Buyurtmalar" scrollable={false}>
        <ErrorView
          error={orders.error}
          onRetry={() => { void orders.refetch(); }}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Buyurtmalar" scrollable={false}>
      {/* Period filter */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.periodBtn,
              period === opt.key && styles.periodBtnActive,
            ]}
            onPress={() => setPeriod(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: period === opt.key }}
          >
            <Text
              style={[
                styles.periodText,
                period === opt.key && styles.periodTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Jami buyurtma</Text>
          <Text style={styles.statValue}>{totalCount} ta</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Jami tushum</Text>
          <Text style={styles.statValue}>{formattedRevenue}</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={18}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buyurtma raqami bo'yicha izla"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Status filter */}
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={String(opt.key)}
            style={[
              styles.statusBtn,
              statusFilter === opt.key && styles.statusBtnActive,
            ]}
            onPress={() => setStatusFilter(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: statusFilter === opt.key }}
          >
            <Text
              style={[
                styles.statusText,
                statusFilter === opt.key && styles.statusTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SalesOrderList
        data={filteredData}
        isRefreshing={orders.isFetching}
        onRefresh={() => { void orders.refetch(); }}
        onPress={handlePress}
      />
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
  // Period filter row
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: Colors.bgSurface,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.textWhite,
  },

  // Stats strip
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.bgSurface,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgSubtle,
    borderRadius: 12,
    padding: 12,
    ...Shadows.card,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Search bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 44,
    padding: 0,
  },

  // Status filter row
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle,
    minHeight: 36,
    justifyContent: 'center',
  },
  statusBtnActive: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusTextActive: {
    color: Colors.textWhite,
  },
});
