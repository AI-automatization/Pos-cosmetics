import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ProductInfo } from '@/api/catalog.api';
import type { ProductStockLevel } from '@/api/inventory.api';
import { formatCurrency, formatDate } from '@/utils/format';

interface Props {
  product: ProductInfo;
  stockLevels: ProductStockLevel[];
  onScanAgain: () => void;
  onAddToCount?: (systemQty: number, actualQty: number) => void;
  isCountMode: boolean;
}

function StockBadge({ stock, minLevel, t }: { stock: number; minLevel: number; t: (k: string) => string }) {
  if (stock <= 0) {
    return <Text style={[styles.badge, styles.badgeOut]}>{t('scanner.stockOut')}</Text>;
  }
  if (stock < minLevel) {
    return <Text style={[styles.badge, styles.badgeLow]}>{t('scanner.stockLow')}</Text>;
  }
  return <Text style={[styles.badge, styles.badgeOk]}>{t('scanner.stockOk')}</Text>;
}

export default function ProductResultCard({
  product,
  stockLevels,
  onScanAgain,
  onAddToCount,
  isCountMode,
}: Props): React.JSX.Element {
  const { t } = useTranslation();

  const totalStock = stockLevels.reduce((sum, s) => sum + s.stock, 0);
  const nearestExpiry = stockLevels
    .map((s) => s.nearestExpiry)
    .filter((d): d is string => d !== null)
    .sort()[0] ?? null;

  return (
    <View style={styles.card}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.barcode}>{product.barcode}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t('scanner.price')}</Text>
        <Text style={styles.value}>{formatCurrency(product.sellPrice, product.currency)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('scanner.stock')}</Text>
        <View style={styles.stockRow}>
          <Text style={styles.value}>{totalStock} {product.unitName}</Text>
          <StockBadge stock={totalStock} minLevel={product.minStockLevel} t={t} />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('scanner.minLevel')}</Text>
        <Text style={styles.value}>{product.minStockLevel} {product.unitName}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('scanner.category')}</Text>
        <Text style={styles.value}>{product.categoryName}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('scanner.expiry')}</Text>
        <Text style={styles.value}>
          {product.expiryTracking
            ? nearestExpiry
              ? formatDate(nearestExpiry)
              : t('common.noData')
            : t('scanner.noExpiry')}
        </Text>
      </View>

      {stockLevels.length > 1 && (
        <View style={styles.warehouseSection}>
          {stockLevels.map((s) => (
            <View key={s.warehouseId} style={styles.warehouseRow}>
              <Text style={styles.warehouseName}>{s.warehouseName}</Text>
              <Text style={styles.warehouseQty}>{s.stock} {product.unitName}</Text>
            </View>
          ))}
        </View>
      )}

      {isCountMode && onAddToCount && (
        <View style={styles.adminNote}>
          <Text style={styles.adminNoteText}>ℹ️ {t('scanner.adminNote')}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.scanAgainBtn} onPress={onScanAgain}>
        <Text style={styles.scanAgainText}>{t('scanner.scanAgain')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  barcode: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  badgeOk: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  badgeLow: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeOut: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  warehouseSection: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  warehouseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  warehouseName: {
    fontSize: 13,
    color: '#6B7280',
  },
  warehouseQty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  adminNote: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 8,
  },
  adminNoteText: {
    fontSize: 12,
    color: '#4338CA',
  },
  scanAgainBtn: {
    marginTop: 12,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scanAgainText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
