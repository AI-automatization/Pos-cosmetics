import React from 'react';
import {
  View,
  Text,
  Modal,
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
import { useScreenProtection } from '../../hooks/useScreenProtection';
import { styles, C } from './OrderDetailSheet.styles';
import {
  SummaryRow,
  LineItem,
  fmt,
  formatDateTime,
} from './OrderDetailSheet.components';
import type { OrderLineItem } from './OrderDetailSheet.components';

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

// ─── Status badge config ────────────────────────────────
type SupportedStatus = 'COMPLETED' | 'RETURNED' | 'VOIDED';

const STATUS_CONFIG: Record<SupportedStatus, { bg: string; color: string; label: string }> = {
  COMPLETED: { bg: '#DCFCE7', color: '#16A34A', label: 'Bajarildi' },
  RETURNED:  { bg: '#FEF3C7', color: '#D97706', label: 'Qaytarildi' },
  VOIDED:    { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
};

const FALLBACK_STATUS = STATUS_CONFIG.VOIDED;

// ─── OrderDetail type ───────────────────────────────────
interface OrderDetail extends Omit<OrderWithMethod, 'items'> {
  items?: OrderLineItem[];
  discount?: number;
  tax?: number;
  note?: string;
}

// ─── Props ──────────────────────────────────────────────
interface OrderDetailSheetProps {
  readonly orderId: string | null;
  readonly onClose: () => void;
}

// ─── OrderDetailSheet ───────────────────────────────────
export default function OrderDetailSheet({ orderId, onClose }: OrderDetailSheetProps) {
  useScreenProtection();
  const visible = orderId !== null;

  const { data, isLoading } = useQuery<OrderDetail>({
    queryKey: ['order-detail', orderId],
    queryFn:  async (): Promise<OrderDetail> => {
      const raw = await salesApi.getOrderById(orderId!);
      const { items: rawItems, ...rest } = raw;
      return {
        ...rest,
        items: rawItems?.map((oi) => ({
          productId: oi.productId,
          productName: oi.productName,
          quantity: oi.quantity,
          price: oi.unitPrice,
          total: oi.total,
        })),
      };
    },
    enabled:  visible,
    staleTime: 60_000,
  });

  const statusKey = (data?.status ?? 'VOIDED') as SupportedStatus;
  const statusCfg = STATUS_CONFIG[statusKey] ?? FALLBACK_STATUS;

  const items    = data?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
  const discount = Number(data?.discount ?? 0);
  const tax      = Number(data?.tax ?? 0);
  const total    = Number(data?.total ?? 0);

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
            {/* Order number, Status badge, Date */}
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
