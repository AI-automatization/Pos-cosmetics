import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './SalesColors';
import { METHOD_STYLE, type OrderStatus } from './SalesTypes';
import type { Sale } from './SalesTypes';
import SaleDetailItems from './SaleDetailItems';
import SaleDetailActions from './SaleDetailActions';
import styles from './SaleDetailModal.styles';

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

            {/* Items + Summary */}
            <SaleDetailItems
              products={sale.products}
              totalItems={sale.items}
            />
          </ScrollView>

          {/* Actions */}
          <SaleDetailActions
            isCompleted={sale.status === 'COMPLETED'}
            onClose={onClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
