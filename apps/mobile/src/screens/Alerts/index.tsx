import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { alertsApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import type { Alert } from '@/api/alerts.api';
import { REFETCH_INTERVALS } from '@/config/constants';
import AlertRow from './AlertRow';
import FilterPills from './FilterPills';
import type { FilterKey } from './FilterPills';
import { styles } from './Alerts.styles';

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

        <FilterPills
          activeFilter={activeFilter}
          onSelect={handleFilterSelect}
          labels={pillLabels}
        />

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
