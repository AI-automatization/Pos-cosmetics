import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './SalesColors';
import { fmt } from './SalesTypes';
import type { Sale } from './SalesTypes';
import { styles } from './ReturnScreen.styles';

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
                  <Text style={styles.itemPrice}>{fmt(p.price)} UZS x {p.qty} ta</Text>
                </View>

                {/* Qty stepper (only when selected) */}
                {isSelected && (
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setQty(i, -1)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
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
