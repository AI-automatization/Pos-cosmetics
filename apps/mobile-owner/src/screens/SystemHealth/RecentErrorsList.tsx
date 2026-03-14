import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SystemError } from '../../api/system.api';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatRelative } from '../../utils/formatDate';

interface RecentErrorsListProps {
  data: SystemError[];
}

export default function RecentErrorsList({ data }: RecentErrorsListProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('systemHealth.recentErrors')}</Text>
      <FlatList<SystemError>
        data={data}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t('systemHealth.emptyErrors')} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.meta}>{item.service} · {formatRelative(item.occurredAt)}</Text>
            </View>
            <Badge
              label={item.level.toUpperCase()}
              variant={item.level === 'error' ? 'error' : 'warning'}
            />
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
    gap: 12,
  },
  left: { flex: 1, gap: 2 },
  message: { fontSize: 13, color: '#374151', lineHeight: 18 },
  meta: { fontSize: 12, color: '#9CA3AF' },
});
