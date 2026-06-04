import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  expensesApi,
  type ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  type Expense,
  type CreateExpensePayload,
} from '../../api/expenses.api';
import ExpenseFormSheet from './ExpenseFormSheet';
import ExpenseCard from './ExpenseCard';

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
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

// ─── ExpensesScreen ────────────────────────────────────
export default function ExpensesScreen() {
  const navigation                      = useNavigation();
  const [filter, setFilter]             = useState<FilterKey>('Barchasi');
  const [sheetVisible, setSheetVisible] = useState(false);

  const queryClient = useQueryClient();

  const categoryParam = filter !== 'Barchasi' ? filter : undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', categoryParam],
    queryFn: () => expensesApi.getExpenses({ category: categoryParam }),
    staleTime: 30_000,
  });

  const expenses: Expense[] = data?.items ?? [];

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
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Xarajatlar</Text>
            <Text style={styles.headerSub}>{data?.total ?? 0} ta yozuv</Text>
          </View>
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

// ─── Screen styles ──────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
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
