import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Product } from './ProductCard';

const C = {
  bg: '#F5F5F7', white: '#FFFFFF', text: '#111827',
  muted: '#9CA3AF', border: '#F3F4F6', primary: '#5B5BD6',
  orange: '#F59E0B', red: '#EF4444',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
}

export default function LowStockSheet({ visible, onClose, lowStockProducts, outOfStockProducts }: Props) {
  const total = lowStockProducts.length + outOfStockProducts.length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mahsulot ogohlantirishlari</Text>
            <Text style={styles.subtitle}>{total} ta mahsulot diqqat talab</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {outOfStockProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, styles.sectionDotRed]} />
                <Text style={[styles.sectionTitle, styles.sectionTitleRed]}>
                  Tugagan ({outOfStockProducts.length} ta)
                </Text>
              </View>
              {outOfStockProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <View style={[styles.productIcon, styles.productIconRed]}>
                    <MaterialCommunityIcons name="package-variant-closed" size={18} color={C.red} />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.stockBadge, styles.stockBadgeRed]}>
                    <Text style={[styles.stockBadgeText, styles.stockBadgeTextRed]}>0 DONA</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {lowStockProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, styles.sectionDotOrange]} />
                <Text style={[styles.sectionTitle, styles.sectionTitleOrange]}>
                  Kam qolgan ({lowStockProducts.length} ta)
                </Text>
              </View>
              {lowStockProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <View style={[styles.productIcon, styles.productIconOrange]}>
                    <MaterialCommunityIcons name="package-variant" size={18} color={C.orange} />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.stockBadge, styles.stockBadgeOrange]}>
                    <Text style={[styles.stockBadgeText, styles.stockBadgeTextOrange]}>{p.stockQty} DONA</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {total === 0 && (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>Barcha mahsulotlar yetarli</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 34, maxHeight: '75%',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionDotRed: { backgroundColor: C.red },
  sectionDotOrange: { backgroundColor: C.orange },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  sectionTitleRed: { color: C.red },
  sectionTitleOrange: { color: C.orange },
  productRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border,
  },
  productIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  productIconRed: { backgroundColor: '#FEE2E2' },
  productIconOrange: { backgroundColor: '#FEF3C7' },
  productName: { flex: 1, fontSize: 13, fontWeight: '500', color: C.text },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  stockBadgeRed: { backgroundColor: '#FEE2E2' },
  stockBadgeOrange: { backgroundColor: '#FEF3C7' },
  stockBadgeText: { fontSize: 11, fontWeight: '700' },
  stockBadgeTextRed: { color: C.red },
  stockBadgeTextOrange: { color: C.orange },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: C.muted },
});
