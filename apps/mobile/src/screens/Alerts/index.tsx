import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AlertsStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { alertsApi } from '@/api';
import { formatRelativeTime } from '@/utils/format';
import type { Alert } from '@/api/alerts.api';
import { REFETCH_INTERVALS } from '@/config/constants';

type Props = {
  navigation: NativeStackNavigationProp<AlertsStackParamList, 'AlertsList'>;
};

const ALERT_ICONS: Record<string, string> = {
  LOW_STOCK: '📦',
  LARGE_SALE: '💰',
  RENTAL_PAYMENT_DUE: '🏠',
  SUSPICIOUS_ACTIVITY: '🔴',
  AI_INSIGHT: '🤖',
  SHIFT_OPENED: '🟢',
  SHIFT_CLOSED: '🔒',
  SYSTEM_ALERT: '⚙️',
};

function AlertRow({ item, onPress }: { item: Alert; onPress: () => void }): React.JSX.Element {
  const priorityVariant: Record<string, 'error' | 'warning' | 'info'> = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'info',
  };

  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.icon}>{ALERT_ICONS[item.type] ?? '🔔'}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <Badge label={item.priority} variant={priorityVariant[item.priority] ?? 'info'} />
    </TouchableOpacity>
  );
}

export default function AlertsListScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: () => alertsApi.getAll(),
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertRow
            item={item}
            onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState message={t('alerts.noAlerts')} icon="✅" />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1a56db',
  },
  icon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: 13,
    color: '#4b5563',
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  separator: {
    height: 8,
  },
});
