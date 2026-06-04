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

  // Backend already filters via useAlerts(statusFilter, priorityFilter).
  const filteredAlerts = alerts.data?.items ?? [];

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
