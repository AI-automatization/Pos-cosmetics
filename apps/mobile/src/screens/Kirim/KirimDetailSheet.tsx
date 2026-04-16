// KirimDetailSheet.tsx — kirim tafsilotlari modal bottom sheet

import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
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
  readonly onApprove: (id: string) => void;
  readonly onReject: (id: string) => void;
  readonly approving: boolean;
  readonly rejecting: boolean;
}

export function DetailSheet({
  visible,
  receipt,
  onClose,
  onApprove,
  onReject,
  approving,
  rejecting,
}: DetailSheetProps) {
  if (!receipt) return null;

  const cfg       = STATUS_CFG[receipt.status];
  const items     = receipt.items ?? [];
  const totalQty  = items.reduce((s, i) => s + i.qty, 0);
  const isPending = receipt.status === 'PENDING';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetNumber}>{receipt.receiptNumber}</Text>
            <Text style={styles.sheetSupplier}>{receipt.supplierName}</Text>
          </View>
          <TouchableOpacity style={styles.sheetCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={C.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sheetMeta}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.sheetDate}>
            <Ionicons name="calendar-outline" size={12} color={C.muted} /> {receipt.date}
          </Text>
        </View>

        {receipt.notes ? (
          <View style={styles.notesRow}>
            <Ionicons name="information-circle-outline" size={14} color={C.orange} />
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} style={styles.itemsScroll}>
          <Text style={styles.itemsTitle}>Mahsulotlar ({items.length} ta)</Text>
          {items.map((item, idx) => (
            <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemIdx}>{idx + 1}</Text>
                <View style={styles.itemNameWrap}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.itemCost}>{formatUZS(item.costPrice)} / dona</Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
                <Text style={styles.itemTotal}>{formatUZS(item.qty * item.costPrice)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sheetFooter}>
          <View style={styles.sheetFooterRow}>
            <Text style={styles.sheetFooterLabel}>Jami miqdor:</Text>
            <Text style={styles.sheetFooterValue}>{totalQty} ta</Text>
          </View>
          <View style={styles.sheetFooterRow}>
            <Text style={styles.sheetFooterLabel}>Jami narx:</Text>
            <Text style={[styles.sheetFooterValue, styles.sheetFooterValueHighlight]}>
              {formatUZS(receipt.totalCost)}
            </Text>
          </View>

          {isPending && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => onReject(receipt.id)}
                disabled={rejecting || approving}
                activeOpacity={0.8}
              >
                {rejecting ? (
                  <ActivityIndicator size="small" color={C.red} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color={C.red} />
                    <Text style={styles.rejectBtnText}>Rad etish</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => onApprove(receipt.id)}
                disabled={approving || rejecting}
                activeOpacity={0.8}
              >
                {approving ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
                    <Text style={styles.approveBtnText}>Qabul qilish</Text>
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
    maxHeight: '88%',
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetNumber:   { fontSize: 18, fontWeight: '800', color: C.text },
  sheetSupplier: { fontSize: 13, color: C.secondary, marginTop: 3 },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sheetDate:  { fontSize: 12, color: C.muted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:  { fontSize: 11, fontWeight: '700' },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
  },
  notesText:    { fontSize: 12, color: C.orange, flex: 1 },
  itemsScroll:  { maxHeight: 320, paddingHorizontal: 20 },
  itemsTitle:   { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  itemLeft:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1, marginRight: 8 },
  itemNameWrap: { flex: 1 },
  itemIdx: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary + '15',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    lineHeight: 22,
  },
  itemName:  { fontSize: 13, fontWeight: '600', color: C.text },
  itemCost:  { fontSize: 11, color: C.muted, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemQty:   { fontSize: 13, fontWeight: '700', color: C.text },
  itemTotal: { fontSize: 12, color: C.secondary },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  sheetFooterRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetFooterLabel:          { fontSize: 14, color: C.secondary },
  sheetFooterValue:          { fontSize: 15, fontWeight: '700', color: C.text },
  sheetFooterValueHighlight: { fontSize: 18, color: C.primary },

  // Approve / Reject
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.red,
    backgroundColor: C.white,
  },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: C.red },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.green,
  },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
});
