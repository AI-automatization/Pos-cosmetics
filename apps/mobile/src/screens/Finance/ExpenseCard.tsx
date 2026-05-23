import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  type ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  type Expense,
} from '../../api/expenses.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
};

// ─── Category config ───────────────────────────────────
const CAT_CONFIG: Record<ExpenseCategory, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; bg: string }> = {
  RENT:      { icon: 'home-outline',    color: C.orange,  bg: '#FFFBEB' },
  SALARY:    { icon: 'people-outline',  color: C.green,   bg: '#F0FDF4' },
  DELIVERY:  { icon: 'bicycle-outline', color: C.primary, bg: '#EFF6FF' },
  UTILITIES: { icon: 'flash-outline',   color: C.primary, bg: '#EFF6FF' },
  OTHER:     { icon: 'grid-outline',    color: C.muted,   bg: C.bg      },
};

function fmt(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

interface ExpenseCardProps {
  readonly expense: Expense;
  readonly onDelete: (id: string) => void;
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const cfg = CAT_CONFIG[expense.category];
  const label = EXPENSE_CATEGORY_LABELS[expense.category];

  const handleMenu = () => {
    Alert.alert(expense.description ?? label, undefined, [
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            "O'chirishni tasdiqlang",
            `"${expense.description ?? label}" o'chirilsinmi?`,
            [
              { text: 'Bekor', style: 'cancel' },
              { text: "O'chirish", style: 'destructive', onPress: () => onDelete(expense.id) },
            ],
          ),
      },
      { text: 'Bekor qilish', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardDesc} numberOfLines={1}>
          {expense.description ?? label}
        </Text>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.catBadgeText, { color: cfg.color }]}>{label}</Text>
          </View>
          <Text style={styles.cardDate}>{expense.date}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardAmount}>{'\u2212'}{fmt(expense.amount)}</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={16} color={C.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, gap: 12,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 5 },
  cardDesc: { fontSize: 14, fontWeight: '700', color: C.text },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 11, color: C.muted },

  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardAmount: { fontSize: 14, fontWeight: '800', color: C.red },
  menuBtn: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});
