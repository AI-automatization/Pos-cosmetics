import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ProductInfo } from '../../api/catalog.api';
import type { ProductStockLevel } from '../../api/inventory.api';
import { formatUZS } from '../../utils/currency';
import { formatDate } from '../../utils/date';

interface Props {
  product: ProductInfo;
  stockLevels: ProductStockLevel[];
  onScanAgain: () => void;
  onAddToCount?: (systemQty: number, actualQty: number) => void;
  isCountMode: boolean;
}

interface StockBadgeProps {
  stock: number;
  minLevel: number;
}

function StockBadge({ stock, minLevel }: StockBadgeProps) {
  const { t } = useTranslation();
  if (stock <= 0) {
    return (
      <View style={[styles.badge, styles.badgeOut]}>
        <Text style={styles.badgeOutText}>{t('scanner.stockOut')}</Text>
      </View>
    );
  }
  if (stock < minLevel) {
    return (
      <View style={[styles.badge, styles.badgeLow]}>
        <Text style={styles.badgeLowText}>{t('scanner.stockLow')}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeOk]}>
      <Text style={styles.badgeOkText}>{t('scanner.stockOk')}</Text>
    </View>
  );
}

function stockQtyStyle(stock: number, minLevel: number): object {
  if (stock <= 0) return styles.stockNumberOut;
  if (stock < minLevel) return styles.stockNumberLow;
  return styles.stockNumberOk;
}

export default function ProductResultCard({
  product,
  stockLevels,
  onScanAgain,
  onAddToCount,
  isCountMode,
}: Props) {
  const { t } = useTranslation();

  const totalStock = stockLevels.reduce((sum, s) => sum + s.stock, 0);
  const nearestExpiry = stockLevels
    .map((s) => s.nearestExpiry)
    .filter((d): d is string => d !== null)
    .sort()[0] ?? null;

  return (
    <View style={styles.card}>
      {/* Header: image placeholder + name/barcode */}
      <View style={styles.headerRow}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>📦</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.barcode}>{product.barcode}</Text>
        </View>
      </View>

      {/* Stock — large centered number */}
      <View style={styles.stockSection}>
        <Text style={[styles.stockNumber, stockQtyStyle(totalStock, product.minStockLevel)]}>
          {totalStock}
        </Text>
        <Text style={styles.stockUnit}>{product.unitName}</Text>
        <StockBadge stock={totalStock} minLevel={product.minStockLevel} />
      </View>

      <View style={styles.divider} />

      {/* Detail rows */}
      <View style={styles.row}>
        <Text style={styles.label}>{t('scanner.price')}</Text>
        <Text style={styles.value}>{formatUZS(product.sellPrice)}</Text>
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
            ? nearestExpiry ? formatDate(nearestExpiry) : t('common.noData')
            : t('scanner.noExpiry')}
        </Text>
      </View>

      {/* Warehouse breakdown */}
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

      {/* Count mode admin note */}
      {isCountMode && onAddToCount && (
        <View style={styles.adminNote}>
          <Text style={styles.adminNoteText}>{t('scanner.adminNote')}</Text>
        </View>
      )}

      {/* Count action — green, full width */}
      {isCountMode && onAddToCount && (
        <TouchableOpacity
          style={styles.countBtn}
          onPress={() => onAddToCount(totalStock, totalStock)}
        >
          <Text style={styles.countBtnText}>{t('scanner.countAdd')}</Text>
        </TouchableOpacity>
      )}

      {/* Scan again — outlined blue */}
      <TouchableOpacity style={styles.scanAgainBtn} onPress={onScanAgain}>
        <Text style={styles.scanAgainText}>{t('scanner.scanAgain')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  imagePlaceholderIcon: { fontSize: 32 },
  headerInfo: { flex: 1, gap: 4 },
  productName: { fontSize: 18, fontWeight: '700', color: '#111827', lineHeight: 24 },
  barcode: { fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' },
  stockSection: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  stockNumber: { fontSize: 36, fontWeight: '700', lineHeight: 40 },
  stockNumberOk: { color: '#16A34A' },
  stockNumberLow: { color: '#D97706' },
  stockNumberOut: { color: '#DC2626' },
  stockUnit: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden' },
  badgeOk: { backgroundColor: '#DCFCE7' },
  badgeOkText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  badgeLow: { backgroundColor: '#FEF3C7' },
  badgeLowText: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  badgeOut: { backgroundColor: '#FEE2E2' },
  badgeOutText: { fontSize: 12, fontWeight: '600', color: '#DC2626' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827', flexShrink: 1, textAlign: 'right' },
  warehouseSection: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  warehouseRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  warehouseName: { fontSize: 13, color: '#6B7280' },
  warehouseQty: { fontSize: 13, fontWeight: '600', color: '#374151' },
  adminNote: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  adminNoteText: { fontSize: 12, color: '#1D4ED8', lineHeight: 16 },
  countBtn: {
    marginTop: 16,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  countBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  scanAgainBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  scanAgainText: { fontSize: 15, fontWeight: '600', color: '#2563EB' },
});
