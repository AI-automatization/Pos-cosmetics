import React, { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { alertsApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { formatRelativeTime } from '@/utils/format';
import type { Alert, AlertType } from '@/api/alerts.api';
import { REFETCH_INTERVALS } from '@/config/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'unread' | 'important';

interface AlertIconConfig {
  readonly iconName: React.ComponentProps<typeof Ionicons>['name'];
  readonly bgColor: string;
  readonly iconColor: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ALERT_ICON_MAP: Record<AlertType | 'default', AlertIconConfig> = {
  LOW_STOCK: {
    iconName: 'warning-outline',
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
  },
  LARGE_SALE: {
    iconName: 'cash-outline',
    bgColor: '#D1FAE5',
    iconColor: '#16A34A',
  },
  RENTAL_PAYMENT_DUE: {
    iconName: 'home-outline',
    bgColor: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  SUSPICIOUS_ACTIVITY: {
    iconName: 'shield-outline',
    bgColor: '#FEE2E2',
    iconColor: '#DC2626',
  },
  AI_INSIGHT: {
    iconName: 'bulb-outline',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
  },
  SHIFT_OPENED: {
    iconName: 'play-circle-outline',
    bgColor: '#D1FAE5',
    iconColor: '#16A34A',
  },
  SHIFT_CLOSED: {
    iconName: 'lock-closed-outline',
    bgColor: '#F3F4F6',
    iconColor: '#6B7280',
  },
  SYSTEM_ALERT: {
    iconName: 'settings-outline',
    bgColor: '#F3F4F6',
    iconColor: '#6B7280',
  },
  default: {
    iconName: 'notifications-outline',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
  },
};

function getIconConfig(type: AlertType): AlertIconConfig {
  return ALERT_ICON_MAP[type] ?? ALERT_ICON_MAP.default;
}

// ─── AlertRow ────────────────────────────────────────────────────────────────

interface AlertRowProps {
  readonly item: Alert;
  readonly onPress: () => void;
}

const AlertRow = React.memo(function AlertRow({ item, onPress }: AlertRowProps): React.JSX.Element {
  const { iconName, bgColor, iconColor } = getIconConfig(item.type);

  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      {/* Icon circle with optional unread dot */}
      <View style={styles.iconWrapper}>
        <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
});

// ─── FilterPills ─────────────────────────────────────────────────────────────

interface FilterPillsProps {
  readonly activeFilter: FilterKey;
  readonly onSelect: (key: FilterKey) => void;
  readonly labels: Record<FilterKey, string>;
}

function FilterPills({ activeFilter, onSelect, labels }: FilterPillsProps): React.JSX.Element {
  const filters: FilterKey[] = ['all', 'unread', 'important'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsContainer}
    >
      {filters.map((key) => (
        <TouchableOpacity
          key={key}
          style={[styles.pill, activeFilter === key && styles.pillActive]}
          onPress={() => onSelect(key)}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, activeFilter === key && styles.pillTextActive]}>
            {labels[key]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── AlertsListScreen ────────────────────────────────────────────────────────

export default function AlertsListScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: safeQueryFn<Alert[]>(() => alertsApi.getAll(), []),
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  const unreadAlerts = useMemo(() => data?.filter((a) => !a.isRead) ?? [], [data]);
  const hasUnread = unreadAlerts.length > 0;

  const filteredData = useMemo<Alert[]>(() => {
    if (!data) return [];
    if (activeFilter === 'unread') return data.filter((a) => !a.isRead);
    if (activeFilter === 'important') return data.filter((a) => a.priority === 'HIGH');
    return data;
  }, [data, activeFilter]);

  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation({
    mutationFn: async (): Promise<void> => {
      const promises = unreadAlerts.map((a) => alertsApi.markAsRead(a.id));
      await Promise.all(promises);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const handleMarkAllRead = useCallback(() => {
    if (!isMarkingAll && hasUnread) {
      markAllRead();
    }
  }, [markAllRead, isMarkingAll, hasUnread]);

  const handleFilterSelect = useCallback((key: FilterKey) => {
    setActiveFilter(key);
  }, []);

  const pillLabels: Record<FilterKey, string> = {
    all: t('alerts.filterAll'),
    unread: t('alerts.filterUnread'),
    important: t('alerts.filterImportant'),
  };

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <View style={styles.screenContent}>
        {/* Screen title row with "Hammasini o'qish" */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>{t('alerts.screenTitle')}</Text>
          {hasUnread && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              disabled={isMarkingAll}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.markAllText, isMarkingAll && styles.markAllTextDisabled]}>
                {t('alerts.markAllRead')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <FilterPills
          activeFilter={activeFilter}
          onSelect={handleFilterSelect}
          labels={pillLabels}
        />

        {/* Alert list */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertRow
              item={item}
              onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
            />
          )}
          ListEmptyComponent={<EmptyState title={t('alerts.noAlerts')} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenLayout>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
  },
  markAllTextDisabled: {
    opacity: 0.4,
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#2563EB',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowUnread: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconWrapper: {
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
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
    color: '#6B7280',
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
