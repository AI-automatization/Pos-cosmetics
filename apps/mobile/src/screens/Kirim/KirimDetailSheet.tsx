// KirimDetailSheet.tsx — kirim tafsilotlari modal bottom sheet (UI-051)

import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { formatUZS } from '../../utils/currency';
import { C } from './KirimColors';
import { STATUS_CFG } from './KirimTypes';

interface DetailSheetProps {
  readonly visible: boolean;
  readonly receipt: Receipt | null;
  readonly onClose: () => void;
  readonly onAccept?: (id: string) => void;
  readonly onCancel?: (id: string) => void;
  readonly isAccepting?: boolean;
  readonly isCancelling?: boolean;
}

export function DetailSheet({
  visible,
  receipt,
  onClose,
  onAccept,
  onCancel,
  isAccepting = false,
  isCancelling = false,
}: DetailSheetProps) {
  if (!receipt) return null;

  const cfg      = STATUS_CFG[receipt.status];
  const items    = receipt.items ?? [];
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const isPending = receipt.status === 'PENDING';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.receiptIconWrap}>
              <Ionicons name="document-text-outline" size={18} color={C.primary} />
            </View>
            <View>
              <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
              <Text style={styles.supplierName} numberOfLines={1}>
                {receipt.supplierName}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={16} color={C.secondary} />
          </TouchableOpacity>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={C.muted} />
            <Text style={styles.infoLabel}>Sana</Text>
            <Text style={styles.infoValue}>{receipt.date}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name={cfg.icon as Parameters<typeof Ionicons>[0]['name']} size={14} color={cfg.text} />
            <Text style={styles.infoLabel}>Holat</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color={C.muted} />
            <Text style={styles.infoLabel}>Jami</Text>
            <Text style={[styles.infoValue, styles.infoValueBold]}>
              {formatUZS(receipt.totalCost)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {receipt.notes ? (
          <View style={styles.notesRow}>
            <Ionicons name="information-circle-outline" size={15} color={C.orange} />
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        ) : null}

        {/* Items list */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>Mahsulotlar</Text>
            <View style={styles.itemsCountBadge}>
              <Text style={styles.itemsCount}>{items.length} ta</Text>
            </View>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Ionicons name="cube-outline" size={28} color={C.muted} />
              <Text style={styles.emptyItemsText}>Mahsulotlar yuklanmadi</Text>
            </View>
          ) : (
            items.map((item, idx) => (
              <View
                key={`${item.productId}-${idx}`}
                style={[styles.itemRow, idx === items.length - 1 && styles.itemRowLast]}
              >
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>{idx + 1}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text style={styles.itemCost}>
                    {formatUZS(item.costPrice)} / {item.unit}
                    {item.batchNumber ? `  •  Partiya: ${item.batchNumber}` : ''}
                  </Text>
                </View>
                <View style={styles.itemAmounts}>
                  <Text style={styles.itemQty}>
                    {item.qty} {item.unit}
                  </Text>
                  <Text style={styles.itemTotal}>{formatUZS(item.qty * item.costPrice)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer summary */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Jami miqdor</Text>
            <Text style={styles.footerValue}>{totalQty} ta</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Jami narx</Text>
            <Text style={[styles.footerValue, styles.footerValueHighlight]}>
              {formatUZS(receipt.totalCost)}
            </Text>
          </View>

          {/* Action buttons — only for PENDING */}
          {isPending && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => onCancel?.(receipt.id)}
                disabled={isAccepting || isCancelling}
                activeOpacity={0.75}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={C.red} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color={C.red} />
                    <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Bekor qilish</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => onAccept?.(receipt.id)}
                disabled={isAccepting || isCancelling}
                activeOpacity={0.75}
              >
                {isAccepting ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
                    <Text style={[styles.actionBtnText, styles.acceptBtnText]}>Qabul qilish</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  receiptIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptNumber: { fontSize: 17, fontWeight: '800', color: C.text },
  supplierName:  { fontSize: 13, color: C.secondary, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info section
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: C.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoValueBold: {
    color: C.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Notes
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesText: { fontSize: 12, color: C.orange, flex: 1, lineHeight: 18 },

  // Scroll / Items
  scroll: { maxHeight: 280 },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  itemsTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  itemsCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  itemsCount: { fontSize: 12, color: C.primary, fontWeight: '600' },

  emptyItems: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyItemsText: { fontSize: 13, color: C.muted },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  itemRowLast: { borderBottomWidth: 0 },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: C.text, lineHeight: 18 },
  itemCost: { fontSize: 11, color: C.muted, marginTop: 2 },
  itemAmounts: { alignItems: 'flex-end', gap: 3 },
  itemQty:   { fontSize: 13, fontWeight: '700', color: C.text },
  itemTotal: { fontSize: 12, color: C.secondary },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 14, color: C.secondary },
  footerValue: { fontSize: 15, fontWeight: '700', color: C.text },
  footerValueHighlight: { fontSize: 17, color: C.primary },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  acceptBtn: {
    backgroundColor: C.green,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtnText: { color: C.red },
  acceptBtnText: { color: C.white },
});
