import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LowStockItem } from '../../api/inventory.api';
import type { NasiyaSummary } from '../../api/nasiya.api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatUZS } from '../../utils/currency';

interface AlertsListProps {
  readonly lowStock: LowStockItem[];
  readonly nasiya: NasiyaSummary | undefined;
}

interface AlertItem {
  readonly id: string;
  readonly text: string;
  readonly variant: 'danger' | 'warning';
}

export default function AlertsList({ lowStock, nasiya }: AlertsListProps) {
  const alerts: AlertItem[] = [];

  lowStock.forEach((item) => {
    alerts.push({
      id: `stock-${item.productId}`,
      text: `${item.productName}: ${item.stock} qoldi (min: ${item.minStockLevel})`,
      variant: item.stock === 0 ? 'danger' : 'warning',
    });
  });

  if (nasiya && nasiya.overdueCount > 0) {
    alerts.push({
      id: 'nasiya-overdue',
      text: `${nasiya.overdueCount} ta muddati o'tgan qarz — ${formatUZS(nasiya.overdueAmount)}`,
      variant: 'danger',
    });
  }

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Ogohlantirishlar</Text>
        {alerts.length > 0 && (
          <Badge label={String(alerts.length)} variant="danger" />
        )}
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
          <Text style={styles.emptyText}>Hamma narsa joyida</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {alerts.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.separator} />}
              <AlertRow item={item} />
            </React.Fragment>
          ))}
        </View>
      )}
    </Card>
  );
}

function AlertRow({ item }: { readonly item: AlertItem }) {
  const isWarning = item.variant === 'warning';
  return (
    <View style={[styles.alertRow, isWarning ? styles.alertWarning : styles.alertDanger]}>
      <Ionicons
        name={isWarning ? 'warning-outline' : 'alert-circle-outline'}
        size={18}
        color={isWarning ? '#D97706' : '#DC2626'}
      />
      <Text style={styles.alertText}>{item.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  list: {
    gap: 0,
  },
  separator: {
    height: 8,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderLeftWidth: 3,
  },
  alertWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#D97706',
  },
  alertDanger: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#DC2626',
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
});
