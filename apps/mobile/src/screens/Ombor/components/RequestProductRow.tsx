import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, STATUS_CFG, getStatus } from './types';
import type { RequestItem } from './types';

// ─── Props ──────────────────────────────────────────────
interface RequestProductRowProps {
  item: RequestItem;
  isHighlighted: boolean;
  onToggle: (productId: string) => void;
  onQtyChange: (productId: string, delta: number) => void;
}

// ─── Component ──────────────────────────────────────────
export default function RequestProductRow({
  item,
  isHighlighted,
  onToggle,
  onQtyChange,
}: RequestProductRowProps) {
  const status   = getStatus(item);
  const cfg      = STATUS_CFG[status];
  const isActive = item.checked;

  return (
    <View
      style={[
        styles.row,
        isActive ? styles.rowChecked : styles.rowUnchecked,
        isHighlighted && styles.rowHighlight,
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          isActive ? styles.checkboxChecked : styles.checkboxUnchecked,
        ]}
        onPress={() => onToggle(item.productId)}
        activeOpacity={0.75}
      >
        {isActive && <Ionicons name="checkmark" size={14} color={C.white} />}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.rowContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        <View style={styles.rowMeta}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.text }]}>
              {cfg.label}
            </Text>
          </View>
          <Text style={styles.stockText}>Qoldiq: {item.stock} ta</Text>
        </View>
      </View>

      {/* Qty control */}
      <View style={[styles.qtyRow, !isActive && styles.qtyRowDisabled]}>
        <TouchableOpacity
          style={styles.qtyBtnMinus}
          onPress={() => onQtyChange(item.productId, -1)}
          disabled={!isActive}
          activeOpacity={0.75}
        >
          <Ionicons name="remove" size={16} color={C.label} />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{item.qty}</Text>

        <TouchableOpacity
          style={styles.qtyBtnPlus}
          onPress={() => onQtyChange(item.productId, 1)}
          disabled={!isActive}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={16} color={C.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowChecked: {
    backgroundColor: C.white,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rowUnchecked: {
    backgroundColor: C.bg,
    opacity: 0.6,
  },
  rowHighlight: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.primary,
  },
  checkboxUnchecked: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  rowContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockText: {
    fontSize: 11,
    color: C.muted,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyRowDisabled: {
    opacity: 0.4,
  },
  qtyBtnMinus: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  qtyBtnPlus: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
