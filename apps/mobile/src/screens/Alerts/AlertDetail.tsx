import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorView from '@/components/common/ErrorView';
import { alertsApi } from '@/api';
import { formatDateTime } from '@/utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetail'>;

export default function AlertDetailScreen({ route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { alertId } = route.params;
  const queryClient = useQueryClient();

  const { data: alerts, isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: () => alertsApi.getAll(),
  });

  const alert = alerts?.find((a) => a.id === alertId);

  const markRead = useMutation({
    mutationFn: () => alertsApi.markAsRead(alertId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  useEffect(() => {
    if (alert && !alert.isRead) {
      markRead.mutate();
    }
  }, [alert?.isRead]); // markRead.mutate is stable — intentionally omitted

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error || !alert) return <ErrorView error={error} onRetry={() => void refetch()} />;

  const priorityVariant: Record<string, 'danger' | 'warning' | 'info'> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info',
  };

  return (
    <ScreenLayout>
      <Card>
        <View style={styles.header}>
          <Badge label={alert.priority} variant={priorityVariant[alert.priority] ?? 'info'} />
          <Text style={styles.date}>{formatDateTime(alert.createdAt)}</Text>
        </View>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
        {alert.branchName ? (
          <Text style={styles.branch}>📍 {alert.branchName}</Text>
        ) : null}
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  branch: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 12,
  },
});
