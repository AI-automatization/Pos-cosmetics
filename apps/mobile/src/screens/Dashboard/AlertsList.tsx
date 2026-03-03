import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LowStockItem } from '../../api/inventory.api';
import type { NasiyaSummary } from '../../api/nasiya.api';
import Card from '../../components/common/Card';
import { formatUZS } from '../../utils/currency';

interface AlertsListProps {
  readonly lowStock: LowStockItem[];
  readonly nasiya: NasiyaSummary | undefined;
}

interface AlertItem {
  id: string;
  icon: string;
  text: string;
  variant: 'error' | 'warning';
}

export default function AlertsList({ lowStock, nasiya }: AlertsListProps) {
  const { t } = useTranslation();

  const alerts: AlertItem[] = [];

  lowStock.forEach((item) => {
    alerts.push({
      id: `stock-${item.productId}`,
      icon: '🔴',
      text: `${item.productName}: ${item.stock} qoldi (min: ${item.minStockLevel})`,
      variant: item.stock === 0 ? 'error' : 'warning',
    });
  });

  if (nasiya && nasiya.overdueCount > 0) {
    alerts.push({
      id: 'nasiya-overdue',
      icon: '💸',
      text: `${nasiya.overdueCount} ta muddati o'tgan qarz — ${formatUZS(nasiya.overdueAmount)}`,
      variant: 'error',
    });
  }

  return (
    <Card>
      <Text style={styles.sectionLabel}>{t('dashboard.alerts')}</Text>
      {alerts.length === 0 ? (
        <Text style={styles.noAlerts}>✅ {t('dashboard.noAlerts')}</Text>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AlertRow item={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Card>
  );
}

function AlertRow({ item }: { item: AlertItem }) {
  return (
    <View style={[styles.alertRow, item.variant === 'error' && styles.alertError]}>
      <Text style={styles.alertIcon}>{item.icon}</Text>
      <Text style={styles.alertText}>{item.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  noAlerts: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  alertError: {
    backgroundColor: '#FEE2E2',
  },
  alertIcon: {
    fontSize: 16,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  separator: {
    height: 8,
  },
});
