import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { C } from './SalesColors';
import { fmt, METHOD_STYLE } from './SalesTypes';
import type { Sale } from './SalesTypes';

interface SaleDetailModalProps {
  readonly sale: Sale | null;
  readonly onClose: () => void;
}

export default function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  if (!sale) return null;

  const payment = sale.payments[0]!;
  const m = METHOD_STYLE[payment.method];

  return (
    <Modal
      visible={!!sale}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalOrderNum}>#{sale.num}</Text>
              <Text style={styles.modalTime}>{sale.time}</Text>
            </View>
            <View style={[styles.modalMethodBadge, { backgroundColor: m.bg }]}>
              <Text style={styles.modalMethodIcon}>{m.icon}</Text>
              <Text style={[styles.modalMethodText, { color: m.text }]}>{m.label}</Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          <Text style={styles.modalSectionTitle}>Mahsulotlar</Text>
          <ScrollView style={styles.modalProductList} showsVerticalScrollIndicator={false}>
            {sale.products.map((p, i) => (
              <View key={i} style={styles.modalProductRow}>
                <View style={styles.modalProductLeft}>
                  <Text style={styles.modalProductName}>{p.name}</Text>
                  <Text style={styles.modalProductQty}>{p.qty} dona</Text>
                </View>
                <Text style={styles.modalProductPrice}>{fmt(p.price * p.qty)} so'm</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalDivider} />

          <Text style={styles.modalSectionTitle}>To'lov</Text>
          <View style={styles.modalPayRow}>
            <View style={[styles.modalPayBadge, { backgroundColor: m.bg }]}>
              <Text style={[styles.modalPayBadgeText, { color: m.text }]}>
                {m.icon} {m.label}
              </Text>
            </View>
            <Text style={[styles.modalPayAmount, { color: m.text }]}>
              {fmt(payment.amount)} so'm
            </Text>
          </View>

          <View style={styles.modalDivider} />

          <View style={styles.modalTotalRow}>
            <Text style={styles.modalTotalLabel}>Jami</Text>
            <Text style={styles.modalTotalValue}>{fmt(sale.amount)} so'm</Text>
          </View>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.modalCloseBtnText}>Yopish</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalOrderNum: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  modalTime: {
    fontSize: 13,
    color: C.secondary,
    marginTop: 2,
  },
  modalMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalMethodIcon: {
    fontSize: 16,
  },
  modalMethodText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  modalProductList: {
    maxHeight: 220,
  },
  modalProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalProductLeft: {
    flex: 1,
    gap: 2,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  modalProductQty: {
    fontSize: 12,
    color: C.muted,
  },
  modalProductPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },
  modalPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalPayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalPayBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalPayAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: C.primary,
  },
  modalCloseBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
