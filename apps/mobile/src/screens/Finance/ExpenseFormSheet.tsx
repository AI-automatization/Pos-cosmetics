import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  type ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  type Expense,
  type CreateExpensePayload,
} from '../../api/expenses.api';
import { expenseSchema, getFieldErrors, type ExpenseFormData } from '../../validation/expense.schema';

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

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!;
}

interface ExpenseFormSheetProps {
  readonly visible: boolean;
  readonly expense: Expense | null;
  readonly onClose: () => void;
  readonly onSaved: (data: CreateExpensePayload) => void;
}

export default function ExpenseFormSheet({ visible, expense, onClose, onSaved }: ExpenseFormSheetProps) {
  const [date, setDate]         = useState(todayStr());
  const [category, setCategory] = useState<ExpenseCategory>('OTHER');
  const [description, setDesc]  = useState('');
  const [amount, setAmount]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  React.useEffect(() => {
    if (visible) {
      setDate(expense?.date ?? todayStr());
      setCategory(expense?.category ?? 'OTHER');
      setDesc(expense?.description ?? '');
      setAmount(expense ? String(expense.amount) : '');
      setFieldErrors({});
    }
  }, [visible, expense]);

  const handleCategoryPick = () => {
    Alert.alert('Kategoriyani tanlang', undefined, [
      ...EXPENSE_CATEGORIES.map((c) => ({
        text: EXPENSE_CATEGORY_LABELS[c],
        onPress: () => {
          setCategory(c);
          setFieldErrors((prev) => ({ ...prev, category: undefined }));
        },
      })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handleSave = () => {
    const parsed = parseFloat(amount);
    const formData = {
      description: description.trim(),
      amount: Number.isNaN(parsed) ? 0 : parsed,
      category,
      date: date || undefined,
    };

    const result = expenseSchema.safeParse(formData);
    const errors = getFieldErrors(result);

    if (!result.success) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSaved({
      date: result.data.date ?? todayStr(),
      category: result.data.category as ExpenseCategory,
      description: result.data.description,
      amount: result.data.amount,
    });
  };

  const cfg = CAT_CONFIG[category];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheet.backdrop} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sheet.wrapper}
      >
        <View style={sheet.panel}>
          <View style={sheet.handle} />

          <View style={sheet.header}>
            <View style={[sheet.iconCircle, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={22} color={cfg.color} />
            </View>
            <Text style={sheet.title}>
              {expense ? 'Xarajatni tahrirlash' : 'Yangi xarajat'}
            </Text>
          </View>

          {/* Date */}
          <Text style={sheet.label}>SANA</Text>
          <TextInput
            style={sheet.input}
            value={date}
            onChangeText={setDate}
            placeholder="2026-04-14"
            placeholderTextColor={C.muted}
          />

          {/* Category */}
          <Text style={sheet.label}>KATEGORIYA</Text>
          <TouchableOpacity
            style={[sheet.selectRow, fieldErrors.category ? sheet.inputError : undefined]}
            onPress={handleCategoryPick}
          >
            <Ionicons name={cfg.icon} size={18} color={cfg.color} />
            <Text style={sheet.selectText}>{EXPENSE_CATEGORY_LABELS[category]}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
          {fieldErrors.category ? (
            <Text style={sheet.errorText}>{fieldErrors.category}</Text>
          ) : null}

          {/* Description */}
          <Text style={sheet.label}>TAVSIF</Text>
          <TextInput
            style={[sheet.input, fieldErrors.description ? sheet.inputError : undefined]}
            value={description}
            onChangeText={(v) => {
              setDesc(v);
              setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Masalan: Fevral oyi ijarasi"
            placeholderTextColor={C.muted}
          />
          {fieldErrors.description ? (
            <Text style={sheet.errorText}>{fieldErrors.description}</Text>
          ) : null}

          {/* Amount */}
          <Text style={sheet.label}>MIQDOR (UZS)</Text>
          <TextInput
            style={[sheet.input, fieldErrors.amount ? sheet.inputError : undefined]}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setFieldErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
          />
          {fieldErrors.amount ? (
            <Text style={sheet.errorText}>{fieldErrors.amount}</Text>
          ) : null}

          <TouchableOpacity
            style={sheet.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={sheet.saveBtnText}>{expense ? 'Saqlash' : "Qo'shish"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Sheet styles ───────────────────────────────────────
const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: C.text },
  label: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 6,
  },
  input: {
    height: 48, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, fontSize: 15, color: C.text,
    marginBottom: 14,
  },
  selectRow: {
    height: 48, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, marginBottom: 14,
  },
  selectText: { flex: 1, fontSize: 15, color: C.text },
  saveBtn: {
    backgroundColor: C.red, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: C.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  inputError: { borderColor: C.red },
  errorText: {
    fontSize: 12,
    color: C.red,
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 4,
  },
});
