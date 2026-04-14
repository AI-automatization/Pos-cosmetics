import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './SalesColors';
import { fmt, METHOD_STYLE, type OrderStatus } from './SalesTypes';
import type { Sale } from './SalesTypes';

// ─── Status badge config ───────────────────────────────────────
const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: '#D1FAE5', text: '#16A34A', label: 'Bajarildi' },
  RETURNED:  { bg: '#FEE2E2', text: '#DC2626', label: 'Qaytarildi' },
  VOIDED:    { bg: '#F3F4F6', text: '#6B7280', label: 'Bekor qilindi' },
};

interface SaleDetailModalProps {
  readonly sale: Sale | null;
  readonly onClose: () => void;
}

export default function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  if (!sale) return null;

  const payment = sale.payments[0]!;
  const m = METHOD_STYLE[payment.method];
  const status = STATUS_STYLE[sale.status] ?? STATUS_STYLE.COMPLETED;
  const isCompleted = sale.status === 'COMPLETED';

  const subtotal = sale.products.reduce((s, p) => s + p.price * p.qty, 0);

  return (
    <Modal
      visible={!!sale}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.orderId}>
                #{String(sale.num).padStart(4, '0')}
              </Text>
              <Text style={styles.orderTime}>{sale.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Info card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={15} color={C.muted} />
                <Text style={styles.infoLabel}>Vaqt</Text>
                <Text style={styles.infoValue}>{sale.time}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={15} color={C.muted} />
                <Text style={styles.infoLabel}>To'lov usuli</Text>
                <View style={[styles.methodPill, { backgroundColor: m.bg }]}>
                  <Text style={[styles.methodPillText, { color: m.text }]}>
                    {m.icon} {m.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items */}
            <Text style={styles.sectionTitle}>MAHSULOTLAR</Text>
            <View style={styles.itemsList}>
              {sale.products.map((p, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.itemMeta}>
                      {p.qty} × {fmt(p.price)} UZS
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {fmt(p.qty * p.price)} UZS
                  </Text>
                </View>
              ))}
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jami mahsulot</Text>
                <Text style={styles.summaryValue}>{sale.items} ta</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Umumiy summa</Text>
                <Text style={styles.summaryTotalValue}>{fmt(subtotal)} UZS</Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          {isCompleted ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnReturn}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Ionicons name="return-up-back-outline" size={18} color="#DC2626" />
                <Text style={styles.btnReturnText}>Qaytarish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrint}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Ionicons name="print-outline" size={18} color="#FFFFFF" />
                <Text style={styles.btnPrintText}>Chek chop etish</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.btnClose}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCloseText}>Yopish</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    letterSpacing: 0.5,
  },
  orderTime: {
    fontSize: 13,
    color: C.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  methodPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  methodPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  itemsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flex: 1,
    gap: 3,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  itemMeta: {
    fontSize: 12,
    color: C.muted,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: C.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnReturn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    height: 50,
  },
  btnReturnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnPrint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    height: 50,
  },
  btnPrintText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnClose: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
