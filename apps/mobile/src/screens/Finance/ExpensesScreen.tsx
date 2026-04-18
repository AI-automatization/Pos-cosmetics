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

// ─── Types ─────────────────────────────────────────────
type Category = 'Ijara' | 'Kommunal' | 'Maosh' | 'Boshqa';
type PayMethod = 'Naqd' | 'Karta' | 'Transfer';

interface Expense {
  id: string;
  category: Category;
  description: string;
  date: string;
  amount: number;
  payMethod: PayMethod;
}

// ─── Category config ───────────────────────────────────
const CAT_CONFIG: Record<Category, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; bg: string }> = {
  Ijara:    { icon: 'home-outline',    color: C.orange,  bg: '#FFFBEB' },
  Kommunal: { icon: 'flash-outline',   color: C.primary, bg: '#EFF6FF' },
  Maosh:    { icon: 'people-outline',  color: C.green,   bg: '#F0FDF4' },
  Boshqa:   { icon: 'grid-outline',    color: C.muted,   bg: C.bg      },
};

const CATEGORIES: Category[] = ['Ijara', 'Kommunal', 'Maosh', 'Boshqa'];
const PAY_METHODS: PayMethod[] = ['Naqd', 'Karta', 'Transfer'];

type FilterKey = 'Barchasi' | Category;
const FILTERS: FilterKey[] = ['Barchasi', ...CATEGORIES];

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
  onSaved: (data: Omit<Expense, 'id'>) => void;
}) {
  const [date, setDate]           = useState(todayStr());
  const [category, setCategory]   = useState<Category>('Boshqa');
  const [description, setDesc]    = useState('');
  const [amount, setAmount]       = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('Naqd');
  const [loading, setLoading]     = useState(false);

  React.useEffect(() => {
    if (visible) {
      setDate(expense?.date ?? todayStr());
      setCategory(expense?.category ?? 'Boshqa');
      setDesc(expense?.description ?? '');
      setAmount(expense ? String(expense.amount) : '');
      setPayMethod(expense?.payMethod ?? 'Naqd');
    }
  }, [visible, expense]);

  const canSave = description.trim().length > 0 && parseFloat(amount) > 0;

  const handleCategoryPick = () => {
    Alert.alert('Kategoriyani tanlang', undefined, [
      ...CATEGORIES.map((c) => ({ text: c, onPress: () => setCategory(c) })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handleMethodPick = () => {
    Alert.alert("To'lov usulini tanlang", undefined, [
      ...PAY_METHODS.map((m) => ({ text: m, onPress: () => setPayMethod(m) })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handleSave = () => {
    if (!canSave) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSaved({ date, category, description: description.trim(), amount: parseFloat(amount), payMethod });
      onClose();
    }, 400);
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
            <Text style={sheet.selectText}>{category}</Text>
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

          {/* Pay method */}
          <Text style={sheet.label}>TO'LOV USULI</Text>
          <TouchableOpacity style={sheet.selectRow} onPress={handleMethodPick}>
            <Ionicons name="card-outline" size={18} color={C.muted} />
            <Text style={sheet.selectText}>{payMethod}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[sheet.saveBtn, !canSave && sheet.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.saveBtnText}>{expense ? 'Saqlash' : "Qo'shish"}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ExpenseCard ───────────────────────────────────────
function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
}) {
  const cfg = CAT_CONFIG[expense.category];

  const handleMenu = () => {
    Alert.alert(expense.description, undefined, [
      { text: 'Tahrirlash', onPress: () => onEdit(expense) },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            "O'chirishni tasdiqlang",
            `"${expense.description}" o'chirilsinmi?`,
            [
              { text: 'Bekor', style: 'cancel' },
              { text: "O'chirish", style: 'destructive', onPress: () => onDelete(expense) },
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
        <Text style={styles.cardDesc} numberOfLines={1}>{expense.description}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.catBadgeText, { color: cfg.color }]}>{expense.category}</Text>
          </View>
          <Text style={styles.cardDate}>{expense.date}</Text>
          <Text style={styles.cardMethod}>{expense.payMethod}</Text>
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
  const [filter, setFilter]           = useState<FilterKey>('Barchasi');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [expenses, setExpenses]       = useState<Expense[]>([]);

  const filtered = useMemo(() => {
    if (filter === 'Barchasi') return expenses;
    return expenses.filter((e) => e.category === filter);
  }, [expenses, filter]);

  const total = useMemo(
    () => filtered.reduce((s, e) => s + e.amount, 0),
    [filtered],
  );

  const handleAdd = () => {
    setEditExpense(null);
    setSheetVisible(true);
  };

  const handleEdit = (e: Expense) => {
    setEditExpense(e);
    setSheetVisible(true);
  };

  const handleDelete = (e: Expense) => {
    setExpenses((prev) => prev.filter((x) => x.id !== e.id));
  };

  const handleSaved = (data: Omit<Expense, 'id'>) => {
    if (editExpense) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editExpense.id ? { ...e, ...data } : e)),
      );
    } else {
      setExpenses((prev) => [{ id: Date.now().toString(), ...data }, ...prev]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Xarajatlar</Text>
          <Text style={styles.headerSub}>{expenses.length} ta yozuv</Text>
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
              {filter === 'Barchasi' ? 'Jami xarajat' : filter}
            </Text>
            <Text style={styles.summaryAmount}>{fmt(total)}</Text>
          </View>
        </View>
        {filtered.length > 0 && (
          <Text style={styles.summaryCount}>{filtered.length} ta</Text>
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
                  name={CAT_CONFIG[f as Category].icon}
                  size={13}
                  color={active ? C.white : CAT_CONFIG[f as Category].color}
                />
              )}
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <ExpenseCard
            expense={item}
            onEdit={handleEdit}
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
              {filter !== 'Barchasi' ? `${filter} bo'yicha xarajat yo'q` : "Xarajatlar yo'q"}
            </Text>
            {filter === 'Barchasi' && (
              <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                <Text style={styles.emptyBtnText}>Birinchisini qo'shish</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ExpenseFormSheet
        visible={sheetVisible}
        expense={editExpense}
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
  cardMethod: { fontSize: 11, color: C.muted },

  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardAmount: { fontSize: 14, fontWeight: '800', color: C.red },
  menuBtn: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.red, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
