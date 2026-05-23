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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { InvoiceDetail } from '../../api/inventory.api';
import { C } from './OmborColors';
import { styles } from './InvoiceDetailSheet.styles';
import { StatusBadge, InfoRow, ItemRow, fmt, formatDateTime } from './InvoiceDetailParts';

// ─── Constants ───────────────────────────────────────────
const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

type InvoiceStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

// ─── Props ───────────────────────────────────────────────
interface InvoiceDetailSheetProps {
  readonly invoiceId: string | null;
  readonly onClose: () => void;
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
            {/* Meta row: invoice number, status badge, date */}
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
                value={data.supplier?.name ?? '\u2014'}
              />
              <InfoRow
                label="Yaratdi"
                value={
                  data.createdBy
                    ? `${data.createdBy.firstName} ${data.createdBy.lastName}`.trim()
                    : '\u2014'
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
