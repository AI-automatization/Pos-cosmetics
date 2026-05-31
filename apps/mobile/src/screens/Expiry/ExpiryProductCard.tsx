// ExpiryProductCard.tsx — FlatList uchun karta komponenti

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { C } from './ExpiryColors';
import { getStatusConfig } from './ExpiryTypes';
import type { ExpiryItem, ExpiredItem, ExpiryTab } from './ExpiryTypes';

interface ExpiryProductCardProps {
  readonly item: ExpiryItem | ExpiredItem;
  readonly tab: ExpiryTab;
}

function formatExpiryDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('uz-UZ');
  } catch {
    return dateStr;
  }
}

function ExpiringCard({ item }: { readonly item: ExpiryItem }) {
  const { t } = useTranslation();
  const status = getStatusConfig(item.daysLeft);
  const statusLabel = item.daysLeft < 0
    ? t('warehouse.daysOverdue', { count: Math.abs(item.daysLeft) })
    : t('warehouse.daysLeft', { count: item.daysLeft });

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="business-outline" size={14} color={C.secondary} />
        <Text style={styles.infoText}>{item.warehouseName}</Text>
      </View>

      {item.batchNumber !== null && item.batchNumber !== undefined && (
        <View style={styles.infoRow}>
          <Ionicons name="barcode-outline" size={14} color={C.secondary} />
          <Text style={styles.infoText}>{t('warehouse.batch', { number: item.batchNumber })}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={C.secondary} />
          <Text style={styles.infoText}>{formatExpiryDate(item.expiryDate)}</Text>
        </View>
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyText}>{item.qty} {t('warehouse.unit')}</Text>
        </View>
      </View>
    </View>
  );
}

function ExpiredCard({ item }: { readonly item: ExpiredItem }) {
  const { t } = useTranslation();
  const expiredAt = new Date(item.expiryDate);
  const today     = new Date();
  const diffMs    = today.getTime() - expiredAt.getTime();
  const daysAgo   = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return (
    <View style={[styles.card, styles.expiredCard]}>
      <View style={styles.expiredIndicator} />
      <View style={styles.expiredContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>

        {item.batchNumber !== null && item.batchNumber !== undefined && (
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={14} color={C.secondary} />
            <Text style={styles.infoText}>{t('warehouse.batch', { number: item.batchNumber })}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.expiredAgoText}>
            {daysAgo > 0 ? t('warehouse.daysExpired', { count: daysAgo }) : t('warehouse.todayExpired')}
          </Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>{item.qty} {t('warehouse.unit')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export const ExpiryProductCard = React.memo(function ExpiryProductCard({
  item,
  tab,
}: ExpiryProductCardProps) {
  if (tab === 'EXPIRING') {
    return <ExpiringCard item={item as ExpiryItem} />;
  }
  return <ExpiredCard item={item as ExpiredItem} />;
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius:    12,
    padding:         14,
    marginHorizontal: 16,
    borderWidth:     1,
    borderColor:     C.border,
  },
  expiredCard: {
    flexDirection: 'row',
    overflow:      'hidden',
    padding:       0,
  },
  expiredIndicator: {
    width:           4,
    backgroundColor: C.red,
    borderTopLeftRadius:    12,
    borderBottomLeftRadius: 12,
  },
  expiredContent: {
    flex:    1,
    padding: 14,
  },
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    gap:            8,
    marginBottom:   8,
  },
  productName: {
    flex:       1,
    fontSize:   15,
    fontWeight: '700',
    color:      C.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      6,
    flexShrink:        0,
  },
  statusText: {
    fontSize:   12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  4,
  },
  infoText: {
    fontSize: 13,
    color:    C.secondary,
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      8,
  },
  qtyBadge: {
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      6,
    borderWidth:       1,
    borderColor:       C.border,
  },
  qtyText: {
    fontSize:   13,
    fontWeight: '600',
    color:      C.text,
  },
  expiredAgoText: {
    fontSize: 13,
    color:    C.red,
    fontWeight: '500',
  },
});
