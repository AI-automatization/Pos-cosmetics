import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  expensesApi,
  ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  Expense,
  CreateExpensePayload,
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

type FilterKey = 'Barchasi' | ExpenseCategory;
const FILTERS: FilterKey[] = ['Barchasi', ...EXPENSE_CATEGORIES];

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!;
}

// ─── ExpenseFormSheet ──────────────────────────────────
function ExpenseFormSheet({
  visible,
  expense,
  onClose,
  onSaved,
}: {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSaved: (data: CreateExpensePayload) => void;
}) {
  const [date, setDate]         = useState(todayStr());
  const [category, setCategory] = useState<ExpenseCategory>('OTHER');
  const [description, setDesc]  = useState('');
  const [amount, setAmount]     = useState('');

  React.useEffect(() => {
    if (visible) {
      setDate(expense?.date ?? todayStr());
      setCategory(expense?.category ?? 'OTHER');
      setDesc(expense?.description ?? '');
      setAmount(expense ? String(expense.amount) : '');
    }
  }, [visible, expense]);

  const canSave = description.trim().length > 0 && parseFloat(amount) > 0;

  const handleCategoryPick = () => {
    Alert.alert('Kategoriyani tanlang', undefined, [
      ...EXPENSE_CATEGORIES.map((c) => ({
        text: EXPENSE_CATEGORY_LABELS[c],
        onPress: () => setCategory(c),
      })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handleSave = () => {
    if (!canSave) return;
    onSaved({
      date,
      category,
      description: description.trim(),
      amount: parseFloat(amount),
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
          <TouchableOpacity style={sheet.selectRow} onPress={handleCategoryPick}>
            <Ionicons name={cfg.icon} size={18} color={cfg.color} />
            <Text style={sheet.selectText}>{EXPENSE_CATEGORY_LABELS[category]}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          {/* Description */}
          <Text style={sheet.label}>TAVSIF</Text>
          <TextInput
            style={sheet.input}
            value={description}
            onChangeText={setDesc}
            placeholder="Masalan: Fevral oyi ijarasi"
            placeholderTextColor={C.muted}
          />

          {/* Amount */}
          <Text style={sheet.label}>MIQDOR (UZS)</Text>
          <TextInput
            style={sheet.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[sheet.saveBtn, !canSave && sheet.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave}
          >
            <Text style={sheet.saveBtnText}>{expense ? 'Saqlash' : "Qo'shish"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ExpenseCard ───────────────────────────────────────
function ExpenseCard({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: (id: string) => void;
}) {
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
        <Text style={styles.cardAmount}>−{fmt(expense.amount)}</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={16} color={C.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── ExpensesScreen ────────────────────────────────────
export default function ExpensesScreen() {
  const [filter, setFilter]             = useState<FilterKey>('Barchasi');
  const [sheetVisible, setSheetVisible] = useState(false);

  const queryClient = useQueryClient();

  const categoryParam = filter !== 'Barchasi' ? filter : undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', categoryParam],
    queryFn: () => expensesApi.getExpenses({ category: categoryParam }),
    staleTime: 30_000,
  });

  const expenses: Expense[] = data?.data ?? [];

  const total = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => expensesApi.createExpense(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setSheetVisible(false);
    },
    onError: () => {
      Alert.alert('Xatolik', "Xarajatni saqlashda xatolik yuz berdi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: () => {
      Alert.alert('Xatolik', "O'chirishda xatolik yuz berdi.");
    },
  });

  const handleAdd = () => {
    setSheetVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSaved = (payload: CreateExpensePayload) => {
    createMutation.mutate(payload);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={44} color={C.red} />
          <Text style={styles.errorText}>Ma'lumotlarni yuklashda xatolik</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void refetch()}>
            <Text style={styles.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Xarajatlar</Text>
          <Text style={styles.headerSub}>{data?.total ?? 0} ta yozuv</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.summaryIcon}>
            <Ionicons name="trending-down-outline" size={18} color={C.red} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>
              {filter === 'Barchasi' ? 'Jami xarajat' : EXPENSE_CATEGORY_LABELS[filter]}
            </Text>
            <Text style={styles.summaryAmount}>{fmt(total)}</Text>
          </View>
        </View>
        {expenses.length > 0 && (
          <Text style={styles.summaryCount}>{expenses.length} ta</Text>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsRow}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.75}
            >
              {f !== 'Barchasi' && (
                <Ionicons
                  name={CAT_CONFIG[f].icon}
                  size={13}
                  color={active ? C.white : CAT_CONFIG[f].color}
                />
              )}
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {f === 'Barchasi' ? 'Barchasi' : EXPENSE_CATEGORY_LABELS[f]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {filter !== 'Barchasi'
                  ? `${EXPENSE_CATEGORY_LABELS[filter]} bo'yicha xarajat yo'q`
                  : "Xarajatlar yo'q"}
              </Text>
              {filter === 'Barchasi' && (
                <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                  <Text style={styles.emptyBtnText}>Birinchisini qo'shish</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <ExpenseFormSheet
        visible={sheetVisible}
        expense={null}
        onClose={() => setSheetVisible(false)}
        onSaved={handleSaved}
      />
    </SafeAreaView>
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
  saveBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Screen styles ──────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.red, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.red, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },

  summaryCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    backgroundColor: '#FEF2F2', borderRadius: 14,
    borderWidth: 1, borderColor: '#FECACA',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
  },
  summaryLabel: { fontSize: 12, color: C.red, fontWeight: '600' },
  summaryAmount: { fontSize: 20, fontWeight: '800', color: C.red },
  summaryCount: { fontSize: 13, color: C.red, fontWeight: '600' },

  pillsScroll: { flexGrow: 0 },
  pillsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.red, borderColor: C.red },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },

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

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.primary, borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.red, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
