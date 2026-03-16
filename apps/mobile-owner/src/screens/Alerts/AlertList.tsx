import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../api/alerts.api';
import AlertRow from './AlertRow';
import EmptyState from '../../components/common/EmptyState';

interface AlertListProps {
  data: Alert[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onPressAlert: (alert: Alert) => void;
}

export default function AlertList({ data, isRefreshing, onRefresh, onPressAlert }: AlertListProps) {
  const { t } = useTranslation();
  return (
    <FlatList<Alert>
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <AlertRow item={item} onPress={onPressAlert} />}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message={t('alerts.emptyAlerts')} />}
    />
  );
}
