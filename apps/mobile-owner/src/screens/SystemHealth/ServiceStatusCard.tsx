import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ServiceStatus } from '../../api/system.api';
import StatusIndicator from '../../components/common/StatusIndicator';
import Card from '../../components/common/Card';

interface ServiceStatusCardProps {
  name: string;
  status: ServiceStatus;
}

export default function ServiceStatusCard({ name, status }: ServiceStatusCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <StatusIndicator status={status.status} />
        <Text style={styles.name}>{name}</Text>
      </View>
      {status.responseMs !== undefined && (
        <Text style={styles.meta}>{status.responseMs}ms</Text>
      )}
      {status.message && <Text style={styles.message}>{status.message}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', color: '#374151', flex: 1 },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  message: { fontSize: 12, color: '#DC2626', marginTop: 2 },
});
