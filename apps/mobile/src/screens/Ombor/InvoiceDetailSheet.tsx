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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { InvoiceDetail, InvoiceDetailItem } from '../../api/inventory.api';
import { C } from './OmborColors';

// ─── Constants ───────────────────────────────────────────
const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

type InvoiceStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

const STATUS_CFG: Record<InvoiceStatus, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: '#FEF3C7', color: '#D97706', label: 'Kutilmoqda' },
  RECEIVED:  { bg: '#DCFCE7', color: '#16A34A', label: 'Qabul qilindi' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
};

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

function formatDateTime(d: string): string {
  const date = new Date(d);
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

// ─── Props ───────────────────────────────────────────────
interface InvoiceDetailSheetProps {
  readonly invoiceId: string | null;
  readonly onClose: () => void;
}

// ─── StatusBadge ─────────────────────────────────────────
interface StatusBadgeProps {
  readonly status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CFG[status as InvoiceStatus] ?? STATUS_CFG.CANCELLED;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── InfoRow ─────────────────────────────────────────────
interface InfoRowProps {
  readonly label: string;
  readonly value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

// ─── ItemRow ─────────────────────────────────────────────
interface ItemRowProps {
  readonly item: InvoiceDetailItem;
}

function ItemRow({ item }: ItemRowProps) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.itemMeta}>
          {item.quantity} dona × {fmt(item.purchasePrice)}
        </Text>
        {item.batchNumber !== null && item.batchNumber !== undefined && (
          <Text style={styles.itemBatch}>Batch: {item.batchNumber}</Text>
        )}
      </View>
      <Text style={styles.itemTotal}>{fmt(item.totalCost)}</Text>
    </View>
  );
}

// ─── InvoiceDetailSheet ──────────────────────────────────
export default function InvoiceDetailSheet({
  invoiceId,
  onClose,
}: InvoiceDetailSheetProps) {
  const queryClient = useQueryClient();
  const visible = invoiceId !== null;

  const { data, isLoading } = useQuery<InvoiceDetail>({
    queryKey: ['warehouse-invoice', invoiceId],
    queryFn:  () => inventoryApi.getInvoice(invoiceId!),
    enabled:  invoiceId !== null,
    staleTime: 60_000,
  });

  const approveMutation = useMutation({
    mutationFn: () => inventoryApi.approveInvoice(invoiceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-invoice', invoiceId] });
      onClose();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => inventoryApi.rejectInvoice(invoiceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-invoice', invoiceId] });
      onClose();
    },
  });

  const items     = data?.items ?? [];
  const totalCost = data?.totalCost ?? 0;
  const statusKey = (data?.status ?? 'CANCELLED') as InvoiceStatus;

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
          <Text style={styles.sheetTitle}>Nakladnoy tafsiloti</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color={C.secondary} />
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
            {/* Meta row: invoice number · status badge · date */}
            <View style={styles.metaRow}>
              <Text style={[styles.invoiceNumber, { fontFamily: MONO }]}>
                #{data.invoiceNumber ?? 'N/A'}
              </Text>
              <StatusBadge status={statusKey} />
              <Text style={styles.invoiceDate}>
                {formatDateTime(data.createdAt)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Info block */}
            <View style={styles.infoBlock}>
              <InfoRow
                label="Yetkazib beruvchi"
                value={data.supplier?.name ?? '—'}
              />
              <InfoRow
                label="Yaratdi"
                value={
                  data.createdBy
                    ? `${data.createdBy.firstName} ${data.createdBy.lastName}`.trim()
                    : '—'
                }
              />
              {data.note !== null && data.note !== undefined && data.note !== '' && (
                <InfoRow label="Izoh" value={data.note} />
              )}
            </View>

            <View style={[styles.divider, styles.dividerMt]} />

            {/* Products section */}
            <Text style={styles.sectionLabel}>MAHSULOTLAR</Text>

            {items.length > 0 ? (
              items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))
            ) : (
              <Text style={styles.emptyItems}>Mahsulotlar yuklanmadi</Text>
            )}

            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>UMUMIY</Text>
              <Text style={styles.totalValue}>{fmt(totalCost)}</Text>
            </View>

            {/* Action buttons — only PENDING */}
            {statusKey === 'PENDING' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.rejectBtn,
                    rejectMutation.isPending ? styles.approveBtnDisabled : null,
                  ]}
                  onPress={() => rejectMutation.mutate()}
                  activeOpacity={0.8}
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <ActivityIndicator size="small" color={C.white} />
                  ) : (
                    <Text style={styles.rejectBtnText}>Bekor qilish</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.approveBtn,
                    approveMutation.isPending ? styles.approveBtnDisabled : null,
                  ]}
                  onPress={() => approveMutation.mutate()}
                  activeOpacity={0.8}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <ActivityIndicator size="small" color={C.white} />
                  ) : (
                    <Text style={styles.approveBtnText}>Tasdiqlash</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────
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

  // ─── Meta row ──────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 14,
  },
  invoiceNumber: {
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
  invoiceDate: {
    fontSize: 12,
    color: C.muted,
    marginLeft: 'auto',
  },

  // ─── Divider ───────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },
  dividerMt: {
    marginTop: 12,
  },

  // ─── Info block ────────────────────────────────
  infoBlock: {
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: C.muted,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    flex: 1,
    textAlign: 'right',
  },

  // ─── Section label ─────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },

  // ─── Item rows ─────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  itemMeta: {
    fontSize: 12,
    color: C.muted,
  },
  itemBatch: {
    fontSize: 11,
    color: C.muted,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },

  emptyItems: {
    fontSize: 13,
    color: C.muted,
    paddingVertical: 12,
    textAlign: 'center',
  },

  // ─── Total row ─────────────────────────────────
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  // ─── Action buttons ────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  approveBtn: {
    flex: 2,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: C.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  approveBtnDisabled: {
    opacity: 0.6,
  },
  approveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
