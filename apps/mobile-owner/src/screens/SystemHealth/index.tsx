import React from 'react';
import { ScrollView, Text, View, RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import ServiceStatusCard from './ServiceStatusCard';
import SyncStatusList from './SyncStatusList';
import RecentErrorsList from './RecentErrorsList';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import { formatRelative } from '../../utils/formatDate';

export default function SystemHealthScreen() {
  const { t } = useTranslation();
  const { health, syncStatus, errors } = useSystemHealth();

  const isLoading = health.isLoading;
  const isError = health.isError;

  const handleRefresh = async () => {
    await Promise.all([health.refetch(), syncStatus.refetch(), errors.refetch()]);
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('systemHealth.title')} showBranchSelector={false}>
        <SkeletonList count={4} />
      </ScreenLayout>
    );
  }

  if (isError || !health.data) {
    return (
      <ScreenLayout title={t('systemHealth.title')} showBranchSelector={false}>
        <ErrorView error={health.error} onRetry={() => { void health.refetch(); }} />
      </ScreenLayout>
    );
  }

  const h = health.data;

  return (
    <ScreenLayout title={t('systemHealth.title')} showBranchSelector={false}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={health.isFetching} onRefresh={() => { void handleRefresh(); }} />
        }
        contentContainerStyle={styles.content}
      >
        <Text style={styles.lastUpdated}>
          {t('systemHealth.lastUpdated')}: {formatRelative(new Date().toISOString())}
        </Text>

        <View style={styles.section}>
          <ServiceStatusCard name={t('systemHealth.apiStatus')} status={h.apiStatus} />
          <ServiceStatusCard name={t('systemHealth.databaseStatus')} status={h.databaseStatus} />
          <ServiceStatusCard name={t('systemHealth.workerStatus')} status={h.workerStatus} />
          <ServiceStatusCard name={t('systemHealth.fiscalStatus')} status={h.fiscalStatus} />
        </View>

        <SyncStatusList data={syncStatus.data ?? []} />
        <RecentErrorsList data={errors.data ?? []} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  lastUpdated: { fontSize: 12, color: '#9CA3AF', padding: 16 },
  section: { paddingHorizontal: 16, paddingVertical: 8 },
});
