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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { formatUZS } from '../../utils/currency';
import { C } from './KirimColors';
import { STATUS_CFG } from './KirimTypes';
import { styles } from './KirimDetailSheet.styles';

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
            <Ionicons name={cfg.icon as React.ComponentProps<typeof Ionicons>['name']} size={14} color={cfg.text} />
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
