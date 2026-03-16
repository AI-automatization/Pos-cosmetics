import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertsStackParamList } from '../../navigation/types';
import ScreenLayout from '../../components/layout/ScreenLayout';
import AlertList from './AlertList';
import AlertDetailScreen from './AlertDetailScreen';
import { useAlerts, AlertStatusFilter, AlertPriorityFilter } from '../../hooks/useAlerts';
import { Alert } from '../../api/alerts.api';
import { Colors, Radii } from '../../config/theme';
import { useAlertsStore } from '../../store/alerts.store';

const Stack = createNativeStackNavigator<AlertsStackParamList>();

const MOCK_ALERTS: Alert[] = [
  { id: 'al1', type: 'OUT_OF_STOCK', title: 'Tovar tugadi', description: "L'Oreal Elvive Shampoo — Chilonzor filialida qolmadi", branchId: 'b1', branchName: 'Chilonzor', entityId: 'p3', isRead: false, priority: 'high', createdAt: new Date(Date.now() - 15 * 60_000).toISOString() },
  { id: 'al2', type: 'SUSPICIOUS_ACTIVITY', title: 'Shubhali faoliyat', description: 'Jahongir Nazarov — 6 ta qaytarish 30 daqiqada (normaldan 4× yuqori)', branchId: 'b4', branchName: "Mirzo Ulug'bek", entityId: 'e3', isRead: false, priority: 'high', createdAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: 'al3', type: 'NASIYA_OVERDUE', title: 'Nasiya muddati o\'tdi', description: 'Sherzod Azimov — 3 200 000 UZS, 98 kun kechikdi', branchId: 'b4', branchName: "Mirzo Ulug'bek", entityId: 'c4', isRead: false, priority: 'high', createdAt: new Date(Date.now() - 5 * 3600_000).toISOString() },
  { id: 'al4', type: 'LOW_STOCK', title: 'Tovar kam qoldi', description: 'Dior Sauvage EDT 60ml — Yunusabad: 3 dona qoldi (min: 5)', branchId: 'b2', branchName: 'Yunusabad', entityId: 'p2', isRead: true, priority: 'medium', createdAt: new Date(Date.now() - 8 * 3600_000).toISOString() },
  { id: 'al5', type: 'EXPIRY_WARNING', title: 'Muddat tugayapti', description: 'Nivea Moisturizing Cream — Sergeli: muddati 29 kun ichida tugaydi', branchId: 'b3', branchName: 'Sergeli', entityId: 'p4', isRead: true, priority: 'medium', createdAt: new Date(Date.now() - 24 * 3600_000).toISOString() },
  { id: 'al6', type: 'LARGE_REFUND', title: 'Katta qaytarish', description: 'Sarvar Qodirov — 580 000 UZS qaytarish (umumiy: 12%)', branchId: 'b1', branchName: 'Chilonzor', entityId: 'e1', isRead: true, priority: 'medium', createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString() },
  { id: 'al7', type: 'SHIFT_CLOSED', title: 'Smena yopildi', description: 'Muhabbat Tosheva — Yunusabad, 9 soat 23 daqiqa, 12 100 000 UZS', branchId: 'b2', branchName: 'Yunusabad', entityId: 's1', isRead: true, priority: 'low', createdAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString() },
];

const STATUS_CHIPS: Array<{ label: string; key: AlertStatusFilter }> = [
  { label: 'Hammasi', key: 'all' },
  { label: "O'qilmagan", key: 'unread' },
];

const PRIORITY_CHIPS: Array<{ label: string; key: AlertPriorityFilter; color: string }> = [
  { label: 'YUQORI', key: 'high', color: Colors.danger },
  { label: "O'RTA", key: 'medium', color: Colors.warning },
  { label: 'PAST', key: 'low', color: Colors.success },
];

function AlertListScreen() {
  const { t } = useTranslation();
  const unreadCount = useAlertsStore((s) => s.unreadCount);
  const [statusFilter, setStatusFilter] = React.useState<AlertStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<AlertPriorityFilter>('all');
  const { alerts, markAsRead, markAllAsRead } = useAlerts(statusFilter, priorityFilter);

  function handlePressAlert(alert: Alert) {
    if (!alert.isRead) {
      markAsRead.mutate(alert.id);
    }
  }

  // Use real data if available, fall back to mock
  const displayAlerts = alerts.data?.items ?? MOCK_ALERTS;

  // Client-side filter mock data by priority/status when no backend
  const filteredAlerts = alerts.data
    ? displayAlerts
    : displayAlerts.filter((a) => {
        const matchStatus =
          statusFilter === 'all' ||
          (statusFilter === 'unread' && !a.isRead) ||
          (statusFilter === 'read' && a.isRead);
        const matchPriority = priorityFilter === 'all' || a.priority === priorityFilter;
        return matchStatus && matchPriority;
      });

  return (
    <ScreenLayout title={t('alerts.title')}>
      <View style={styles.filtersContainer}>
        {/* Row 1: Status + mark all */}
        <View style={styles.filterRow}>
          {STATUS_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, statusFilter === chip.key && styles.chipActive]}
              onPress={() => {
                setStatusFilter(chip.key);
                setPriorityFilter('all');
              }}
            >
              <Text style={[styles.chipText, statusFilter === chip.key && styles.chipTextActive]}>
                {chip.label}
                {chip.key === 'unread' && unreadCount > 0 ? ` · ${unreadCount}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => { markAllAsRead.mutate(); }}
            style={styles.markAll}
          >
            <Text style={styles.markAllText}>{t('alerts.markAllRead')}</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Priority chips */}
        <View style={styles.filterRow}>
          {PRIORITY_CHIPS.map((chip) => {
            const isActive = priorityFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[
                  styles.priorityChip,
                  { borderColor: chip.color },
                  isActive && { backgroundColor: chip.color },
                ]}
                onPress={() => {
                  setPriorityFilter(isActive ? 'all' : chip.key);
                  setStatusFilter('all');
                }}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    { color: isActive ? Colors.textWhite : chip.color },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <AlertList
        data={filteredAlerts}
        isRefreshing={alerts.isFetching}
        onRefresh={() => { void alerts.refetch(); }}
        onPressAlert={handlePressAlert}
      />
    </ScreenLayout>
  );
}

export default function AlertsScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AlertList" component={AlertListScreen} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  markAll: {
    marginLeft: 'auto',
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  priorityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
