import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api/sales.api';
import type { OrderWithMethod } from '../../api/sales.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  orange:  '#D97706',
  gray:    '#6B7280',
  red:     '#DC2626',
};

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

// ─── Status badge config ────────────────────────────────
type SupportedStatus = 'COMPLETED' | 'RETURNED' | 'VOIDED';

const STATUS_CONFIG: Record<SupportedStatus, { bg: string; color: string; label: string }> = {
  COMPLETED: { bg: '#DCFCE7', color: '#16A34A', label: 'Bajarildi' },
  RETURNED:  { bg: '#FEF3C7', color: '#D97706', label: 'Qaytarildi' },
  VOIDED:    { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
};

const FALLBACK_STATUS = STATUS_CONFIG.VOIDED;

// ─── OrderWithMethod kengaytmasi (API javobiga mos) ────
interface OrderDetail extends OrderWithMethod {
  items?: OrderLineItem[];
  discount?: number;
  tax?: number;
  note?: string;
}

interface OrderLineItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  total: number;
}

// ─── Props ─────────────────────────────────────────────
interface OrderDetailSheetProps {
  readonly orderId: string | null;
  readonly onClose: () => void;
}

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

function formatDateTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return (
    date.toLocaleDateString('uz-UZ', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    }) +
    ' · ' +
    date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── SummaryRow ────────────────────────────────────────
interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
  readonly bold?: boolean;
  readonly color?: string;
}

function SummaryRow({ label, value, bold, color }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold ? styles.summaryLabelBold : null]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          bold ? styles.summaryValueBold : null,
          color ? { color } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── LineItem ──────────────────────────────────────────
function LineItem({ item }: { readonly item: OrderLineItem }) {
  return (
    <View style={styles.lineItem}>
      <View style={styles.lineItemLeft}>
        <Text style={styles.lineItemName} numberOfLines={2}>
          {item.productName ?? item.productId}
        </Text>
        <Text style={styles.lineItemMeta}>
          {item.quantity} x {fmt(item.price)}
        </Text>
      </View>
      <Text style={styles.lineItemTotal}>{fmt(item.total)}</Text>
    </View>
  );
}

// ─── OrderDetailSheet ──────────────────────────────────
export default function OrderDetailSheet({ orderId, onClose }: OrderDetailSheetProps) {
  const visible = orderId !== null;

  const { data, isLoading } = useQuery<OrderDetail>({
    queryKey: ['order-detail', orderId],
    queryFn:  () => salesApi.getOrderById(orderId!) as Promise<OrderDetail>,
    enabled:  visible,
    staleTime: 60_000,
  });

  const statusKey = (data?.status ?? 'VOIDED') as SupportedStatus;
  const statusCfg = STATUS_CONFIG[statusKey] ?? FALLBACK_STATUS;

  const items    = data?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = data?.discount ?? 0;
  const tax      = data?.tax ?? 0;
  const total    = data?.total ?? 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>To'lov tafsiloti</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color={C.gray} />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        )}

        {/* Content */}
        {!isLoading && data && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Order number · Status badge · Date */}
            <View style={styles.metaRow}>
              <Text style={[styles.orderNumber, { fontFamily: MONO }]}>
                #{String(data.orderNumber).padStart(4, '0')}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                  {statusCfg.label}
                </Text>
              </View>
              <Text style={styles.orderDate}>
                {formatDateTime(data.createdAt)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Products */}
            <Text style={styles.sectionLabel}>MAHSULOTLAR</Text>

            {items.length > 0 ? (
              items.map((item, idx) => (
                <LineItem key={`${item.productId}-${idx}`} item={item} />
              ))
            ) : (
              <Text style={styles.emptyItems}>Mahsulotlar yuklanmadi</Text>
            )}

            <View style={styles.divider} />

            {/* Summary rows */}
            <View style={styles.summaryBlock}>
              <SummaryRow
                label="Jami (soliqlarsiz)"
                value={fmt(subtotal)}
              />
              {discount > 0 && (
                <SummaryRow
                  label="Chegirma"
                  value={`- ${fmt(discount)}`}
                  color={C.orange}
                />
              )}
              {tax > 0 && (
                <SummaryRow
                  label="Soliq"
                  value={fmt(tax)}
                />
              )}
            </View>

            {/* Total separator (heavy line) */}
            <View style={styles.totalSeparator} />

            <SummaryRow
              label="UMUMIY"
              value={fmt(total)}
              bold
            />

            {/* Note (conditional) */}
            {!!data.note && (
              <View style={styles.noteBlock}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={14}
                  color={C.muted}
                />
                <Text style={styles.noteText}>{data.note}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 36,
    // Shadow
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },

  // ─── Meta row ──────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 14,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: C.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 12,
    color: C.muted,
    marginLeft: 'auto',
  },

  // ─── Divider ───────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },

  // ─── Section label ─────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },

  // ─── Line items ────────────────────────────
  lineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  lineItemLeft: {
    flex: 1,
    gap: 2,
  },
  lineItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  lineItemMeta: {
    fontSize: 12,
    color: C.muted,
  },
  lineItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },

  emptyItems: {
    fontSize: 13,
    color: C.muted,
    paddingVertical: 12,
    textAlign: 'center',
  },

  // ─── Summary ───────────────────────────────
  summaryBlock: {
    marginTop: 8,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: C.muted,
  },
  summaryLabelBold: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  totalSeparator: {
    height: 2,
    backgroundColor: C.border,
    marginVertical: 10,
  },

  // ─── Note ──────────────────────────────────
  noteBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 14,
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: C.gray,
    lineHeight: 18,
  },
});
