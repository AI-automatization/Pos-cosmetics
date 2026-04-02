import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BranchSyncStatus } from '../../api/system.api';
import StatusIndicator from '../../components/common/StatusIndicator';
import { formatRelative } from '../../utils/formatDate';

interface SyncStatusListProps {
  data: BranchSyncStatus[];
}

export default function SyncStatusList({ data }: SyncStatusListProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('systemHealth.syncStatus')}</Text>
      <FlatList<BranchSyncStatus>
        data={data}
        scrollEnabled={false}
        keyExtractor={(item) => item.branchId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.branchName}>{item.branchName}</Text>
              <Text style={styles.meta}>{t('systemHealth.lastSync')}: {formatRelative(item.lastSyncAt)}</Text>
              {item.pendingItems > 0 && (
                <Text style={styles.pending}>{t('systemHealth.pendingItems')}: {item.pendingItems}</Text>
              )}
            </View>
            <StatusIndicator status={item.status === 'synced' ? 'healthy' : item.status === 'offline' ? 'offline' : 'degraded'} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  left: { flex: 1, gap: 2 },
  branchName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#9CA3AF' },
  pending: { fontSize: 12, color: '#CA8A04', fontWeight: '600' },
});
