import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from './OmborColors';

// ─── Helpers ────────────────────────────────────────────
export function fmtPrice(n: number): string {
  return n.toLocaleString('uz-UZ') + ' UZS';
}

// ─── InfoRow ────────────────────────────────────────────
interface InfoRowProps {
  readonly label: string;
  readonly value?: string;
  readonly onPress?: () => void;
  readonly isLast?: boolean;
  readonly rightElement?: React.ReactNode;
}

export function InfoRow({ label, value, onPress, isLast, rightElement }: InfoRowProps) {
  const content = (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      {rightElement ?? (
        <Text
          style={[styles.infoValue, onPress ? styles.infoValueLink : null]}
          numberOfLines={2}
        >
          {value ?? '\u2014'}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── StatusBadge ────────────────────────────────────────
interface StatusBadgeProps {
  readonly isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
        {isActive ? 'Faol' : 'Nofaol'}
      </Text>
    </View>
  );
}

// ─── ProductRow ─────────────────────────────────────────
export interface LinkedProduct {
  readonly id: string;
  readonly name: string;
  readonly sku: string | null;
  readonly sellPrice: number;
  readonly isActive: boolean;
}

interface ProductRowProps {
  readonly item: LinkedProduct;
}

export function ProductRow({ item }: ProductRowProps) {
  return (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        {item.sku ? <Text style={styles.productSku}>{item.sku}</Text> : null}
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>{fmtPrice(item.sellPrice)}</Text>
        <StatusBadge isActive={item.isActive} />
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  // InfoRow
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  infoValueLink: {
    color: C.primary,
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextActive: { color: C.green },
  badgeTextInactive: { color: C.red },

  // ProductRow
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.white,
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  productSku: {
    fontSize: 12,
    color: C.muted,
  },
  productRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
  },
});
