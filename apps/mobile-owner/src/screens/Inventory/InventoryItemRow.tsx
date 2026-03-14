import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../api/inventory.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Colors, Radii } from '../../config/theme';

interface InventoryItemRowProps {
  item: InventoryItem;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; labelKey: string }> = {
  normal:       { bg: Colors.successLight,  text: Colors.success, labelKey: 'inventory.statusNormal' },
  low:          { bg: Colors.warningLight,  text: Colors.warning, labelKey: 'inventory.statusLow' },
  out_of_stock: { bg: Colors.dangerLight,   text: Colors.danger,  labelKey: 'inventory.statusOut' },
  expiring:     { bg: Colors.orangeLight,   text: Colors.orange,  labelKey: 'inventory.statusExpiring' },
  expired:      { bg: Colors.dangerLight,   text: Colors.danger,  labelKey: 'inventory.statusExpired' },
};

export default function InventoryItemRow({ item }: InventoryItemRowProps) {
  const { t } = useTranslation();
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.normal;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.productName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusText, { color: badge.text }]}>
              {t(badge.labelKey)}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>{item.barcode} · {item.branchName}</Text>
        {item.expiryDate && (
          <Text style={[styles.meta, (item.status === 'expiring' || item.status === 'expired') && styles.expiryWarn]}>
            {t('inventory.expiry')}: {formatDate(item.expiryDate)}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.qty, { color: badge.text }]}>{item.quantity} {item.unit}</Text>
        <Text style={styles.value}>{formatCurrency(item.stockValue)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.bgSurface,
  },
  info: { flex: 1, gap: 3, paddingRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 12, color: Colors.textSecondary },
  expiryWarn: { color: Colors.orange, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 4 },
  qty: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 12, color: Colors.textSecondary },
});
