import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../api/inventory.api';
import { formatDate } from '../../utils/formatDate';
import { Colors, Radii } from '../../config/theme';

interface Props {
  item: InventoryItem;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  normal:       { bg: Colors.successLight, text: Colors.success, label: 'Normal' },
  low:          { bg: Colors.warningLight, text: Colors.warning, label: 'Kam' },
  out_of_stock: { bg: Colors.dangerLight,  text: Colors.danger,  label: 'Tugagan' },
  expiring:     { bg: Colors.orangeLight,  text: Colors.orange,  label: 'Muddati yaqin' },
  expired:      { bg: Colors.dangerLight,  text: Colors.danger,  label: 'Muddati o\'tgan' },
};

export default function WarehouseItemRow({ item }: Props) {
  const { t } = useTranslation();
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.normal;
  const isLowOrOut = item.status === 'low' || item.status === 'out_of_stock';
  const isExpiryWarning = item.status === 'expiring' || item.status === 'expired';

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.productName}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>

        <Text style={styles.barcode}>{item.barcode}</Text>
        <Text style={styles.branch}>{item.branchName}</Text>

        {isLowOrOut && (
          <Text style={styles.minLevel}>
            {t('warehouse.minLevel', 'Min: {{count}} {{unit}}', { count: item.reorderLevel, unit: item.unit })}
          </Text>
        )}

        {item.expiryDate && (
          <Text style={[styles.expiry, isExpiryWarning && styles.expiryWarn]}>
            {t('warehouse.expiry', 'Muddat')}: {formatDate(item.expiryDate)}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.qty, { color: badge.text }]}>
          {item.quantity}
        </Text>
        <Text style={styles.unit}>{item.unit}</Text>
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
  left: { flex: 1, gap: 3, paddingRight: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.pill },
  badgeText: { fontSize: 11, fontWeight: '600' },
  barcode: { fontSize: 11, color: Colors.textMuted, fontFamily: 'monospace' },
  branch: { fontSize: 12, color: Colors.textSecondary },
  minLevel: { fontSize: 12, color: Colors.warning, fontWeight: '500' },
  expiry: { fontSize: 12, color: Colors.textSecondary },
  expiryWarn: { color: Colors.orange, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 2 },
  qty: { fontSize: 22, fontWeight: '700' },
  unit: { fontSize: 11, color: Colors.textMuted },
});
