import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './SalesColors';
import { fmt } from './SalesTypes';
import type { Sale } from './SalesTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly sale: Sale;
  readonly onClose: () => void;
  readonly onConfirm?: (selectedIndexes: number[], qtys: Record<number, number>, reason: string) => void;
}

// ─── Component ─────────────────────────────────────────
export default function ReturnScreen({ sale, onClose, onConfirm }: Props) {
  const [selected, setSelected]   = useState<Record<number, boolean>>({});
  const [qtys, setQtys]           = useState<Record<number, number>>({});
  const [reason, setReason]       = useState('');
  const [loading, setLoading]     = useState(false);

  const toggleItem = (i: number) => {
    setSelected((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      if (!next[i]) {
        setQtys((q) => { const qq = { ...q }; delete qq[i]; return qq; });
      } else {
        setQtys((q) => ({ ...q, [i]: 1 }));
      }
      return next;
    });
  };

  const setQty = (i: number, delta: number) => {
    const max = sale.products[i]!.qty;
    setQtys((prev) => {
      const next = Math.min(max, Math.max(1, (prev[i] ?? 1) + delta));
      return { ...prev, [i]: next };
    });
  };

  const returnTotal = useMemo(() => {
    return sale.products.reduce((sum, p, i) => {
      if (!selected[i]) return sum;
      return sum + (qtys[i] ?? 1) * p.price;
    }, 0);
  }, [selected, qtys, sale.products]);

  const canConfirm = Object.values(selected).some(Boolean);

  const handleConfirm = () => {
    if (!canConfirm) return;
    Alert.alert(
      'Qaytarishni tasdiqlash',
      `${fmt(returnTotal)} UZS miqdorida qaytarish amalga oshiriladi. Davom etasizmi?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Tasdiqlash',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            const indexes = Object.entries(selected)
              .filter(([, v]) => v)
              .map(([k]) => Number(k));
            onConfirm?.(indexes, qtys, reason);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Qaytarish —{' '}
          <Text style={styles.headerOrderId}>
            #{String(sale.num).padStart(4, '0')}
          </Text>
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Section label */}
        <Text style={styles.sectionLabel}>QAYTARILADIGAN MAHSULOTLAR</Text>

        {/* Items */}
        <View style={styles.itemsList}>
          {sale.products.map((p, i) => {
            const isSelected = !!selected[i];
            const qty = qtys[i] ?? 1;
            return (
              <View key={i} style={[styles.itemRow, i > 0 && styles.itemRowBorder]}>
                {/* Checkbox */}
                <TouchableOpacity
                  style={[styles.checkbox, isSelected && styles.checkboxActive]}
                  onPress={() => toggleItem(i)}
                  activeOpacity={0.75}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Product info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.itemPrice}>{fmt(p.price)} UZS × {p.qty} ta</Text>
                </View>

                {/* Qty stepper (only when selected) */}
                {isSelected && (
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setQty(i, -1)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepQty}>{qty}</Text>
                    <TouchableOpacity
                      style={[styles.stepBtn, styles.stepBtnAdd]}
                      onPress={() => setQty(i, +1)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.stepBtnText, styles.stepBtnTextLight]}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Return reason */}
        <Text style={styles.sectionLabel}>QAYTARISH SABABI</Text>
        <TextInput
          style={styles.reasonInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Qaytarish sababini yozing (ixtiyoriy)..."
          placeholderTextColor={C.muted}
          value={reason}
          onChangeText={setReason}
        />

        {/* Return summary */}
        {canConfirm && (
          <View style={styles.summaryBox}>
            <Ionicons name="cash-outline" size={20} color="#D97706" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Qaytarish summasi</Text>
              <Text style={styles.summaryAmount}>{fmt(returnTotal)} UZS</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!canConfirm || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="return-up-back-outline"
                size={18}
                color={canConfirm ? '#FFFFFF' : C.muted}
              />
              <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>
                Qaytarishni tasdiqlash
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
  },
  headerOrderId: {
    color: '#2563EB',
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  itemsList: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  itemPrice: {
    fontSize: 12,
    color: C.muted,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnAdd: {
    backgroundColor: '#2563EB',
  },
  stepBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 17,
  },
  stepBtnTextLight: {
    color: '#FFFFFF',
  },
  stepQty: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    minWidth: 20,
    textAlign: 'center',
  },
  reasonInput: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 14,
    color: C.text,
    minHeight: 100,
    marginBottom: 8,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 52,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: C.muted,
  },
});
