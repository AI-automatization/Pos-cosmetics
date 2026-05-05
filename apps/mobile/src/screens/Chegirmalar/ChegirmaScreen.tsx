import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { promotionsApi } from '@/api';
import type { Promotion, CreateDiscountDto } from '@/api';
import type { MoreStackParamList } from '../../navigation/types';
import EmptyState from '@/components/common/EmptyState';
import ErrorView from '@/components/common/ErrorView';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
} as const;

type FilterKey = 'ALL' | 'ACTIVE' | 'ENDED';
type DiscountType = 'PERCENT' | 'FIXED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL',    label: 'Barchasi' },
  { key: 'ACTIVE', label: 'Faol' },
  { key: 'ENDED',  label: 'Yakunlangan' },
];

const QUERY_KEY = ['promotions', 'discounts'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string): string => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
};

const fmtValue = (type: DiscountType, rules: Record<string, unknown>): string => {
  if (type === 'PERCENT') {
    return `${rules['percent'] as number}%`;
  }
  return `${Number(rules['amount']).toLocaleString('ru-RU')} so'm`;
};

// ─── DiscountCard ─────────────────────────────────────────────────────────────

interface DiscountCardProps {
  readonly item: Promotion;
}

const DiscountCard = React.memo(function DiscountCard({ item }: DiscountCardProps) {
  const type = item.type as DiscountType;
  const badgeColor = type === 'PERCENT' ? C.primary : C.green;
  const badgeLabel = type === 'PERCENT' ? '%' : "so'm";
  const valueStr = fmtValue(type, item.rules);
  const dateFrom = fmtDate(item.validFrom);
  const dateTo = item.validTo ? fmtDate(item.validTo) : 'Muddatsiz';

  return (
    <View style={styles.card}>
      <View style={[styles.typeBadgeCircle, { backgroundColor: badgeColor + '1A' }]}>
        <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusEnded]}>
            <Text style={[styles.statusText, item.isActive ? styles.statusActiveText : styles.statusEndedText]}>
              {item.isActive ? 'Faol' : 'Yakunlangan'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardValue}>{valueStr}</Text>
        <Text style={styles.cardDate}>{dateFrom} — {dateTo}</Text>
      </View>
    </View>
  );
});

// ─── CreateModal ──────────────────────────────────────────────────────────────

interface CreateModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

function CreateModal({ visible, onClose, onSuccess }: CreateModalProps) {
  const queryClient = useQueryClient();
  const [name, setName]         = useState('');
  const [type, setType]         = useState<DiscountType>('PERCENT');
  const [value, setValue]       = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo]   = useState('');

  const resetForm = useCallback(() => {
    setName('');
    setType('PERCENT');
    setValue('');
    setValidFrom('');
    setValidTo('');
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateDiscountDto) => promotionsApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      resetForm();
      onSuccess();
    },
  });

  const handleSave = useCallback(() => {
    const trimName = name.trim();
    const numValue = parseFloat(value);
    if (!trimName || isNaN(numValue) || numValue <= 0 || !validFrom.trim()) return;

    const dto: CreateDiscountDto = {
      name: trimName,
      type,
      rules: type === 'PERCENT' ? { percent: numValue } : { amount: numValue },
      validFrom: validFrom.trim(),
      validTo: validTo.trim() || null,
      isActive: true,
    };
    mutate(dto);
  }, [name, type, value, validFrom, validTo, mutate]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Yangi chegirma</Text>

            {/* Name */}
            <Text style={styles.fieldLabel}>Nomi</Text>
            <TextInput
              style={styles.input}
              placeholder="Chegirma nomi"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />

            {/* Type toggle */}
            <Text style={styles.fieldLabel}>Turi</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, type === 'PERCENT' && styles.toggleBtnActive]}
                onPress={() => setType('PERCENT')}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleText, type === 'PERCENT' && styles.toggleTextActive]}>
                  Foiz (%)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, type === 'FIXED' && styles.toggleBtnActive]}
                onPress={() => setType('FIXED')}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleText, type === 'FIXED' && styles.toggleTextActive]}>
                  Miqdor (so'm)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Value */}
            <Text style={styles.fieldLabel}>
              {type === 'PERCENT' ? 'Foiz miqdori (1–100)' : "So'm miqdori (UZS)"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'PERCENT' ? 'Masalan: 15' : 'Masalan: 5000'}
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
            />

            {/* Valid from */}
            <Text style={styles.fieldLabel}>Boshlanish sanasi</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.muted}
              value={validFrom}
              onChangeText={setValidFrom}
            />

            {/* Valid to */}
            <Text style={styles.fieldLabel}>Tugash sanasi (ixtiyoriy)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.muted}
              value={validTo}
              onChangeText={setValidTo}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.75}>
                <Text style={styles.cancelBtnText}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isPending}
                activeOpacity={0.8}
              >
                {isPending
                  ? <ActivityIndicator size="small" color={C.white} />
                  : <Text style={styles.saveBtnText}>Saqlash</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ChegirmaScreen ───────────────────────────────────────────────────────────

export default function ChegirmaScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab]         = useState<FilterKey>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => promotionsApi.getAll(),
    staleTime: 30_000,
  });

  const discounts = useMemo(() => {
    const base = (data ?? []).filter(
      (p) => p.type === 'PERCENT' || p.type === 'FIXED',
    );
    if (tab === 'ACTIVE') return base.filter((p) => p.isActive);
    if (tab === 'ENDED')  return base.filter((p) => !p.isActive);
    return base;
  }, [data, tab]);

  const keyExtractor = useCallback((item: Promotion) => item.id, []);
  const renderItem   = useCallback(
    ({ item }: { item: Promotion }) => <DiscountCard item={item} />,
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chegirmalar</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  const allDiscounts = (data ?? []).filter(
    (p) => p.type === 'PERCENT' || p.type === 'FIXED',
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chegirmalar</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={24} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'ALL'    ? allDiscounts.length :
            f.key === 'ACTIVE' ? allDiscounts.filter((p) => p.isActive).length :
                                 allDiscounts.filter((p) => !p.isActive).length;
          const active = tab === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setTab(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                {f.label}
              </Text>
              <Text style={[styles.filterCount, active && styles.filterCountActive]}>
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={discounts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState title="Chegirma topilmadi" />}
      />

      {/* Create modal */}
      <CreateModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  loader:  { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn:       { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: -8 },
  headerTitle:   { flex: 1, fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center' },
  headerSpacer:  { width: 40 },
  addBtn:        { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive:  { backgroundColor: '#EFF6FF', borderColor: C.primary },
  filterLabel:       { fontSize: 12, fontWeight: '600', color: C.muted },
  filterLabelActive: { color: C.primary },
  filterCount:       { fontSize: 13, fontWeight: '800', color: C.text },
  filterCountActive: { color: C.primary },

  listContent: { padding: 16, paddingBottom: 32 },
  separator:   { height: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  typeBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText:  { fontSize: 14, fontWeight: '800' },
  cardBody:       { flex: 1, gap: 4 },
  cardRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName:       { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  cardValue:      { fontSize: 14, fontWeight: '600', color: C.text },
  cardDate:       { fontSize: 12, color: C.muted },

  statusBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusActive:      { backgroundColor: '#D1FAE5' },
  statusEnded:       { backgroundColor: '#F3F4F6' },
  statusText:        { fontSize: 11, fontWeight: '700' },
  statusActiveText:  { color: C.green },
  statusEndedText:   { color: C.muted },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle:   { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 20 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  toggleBtnActive:  { backgroundColor: '#EFF6FF', borderColor: C.primary },
  toggleText:       { fontSize: 14, fontWeight: '600', color: C.muted },
  toggleTextActive: { color: C.primary },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: C.text },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: C.muted },
  saveBtnText:     { fontSize: 15, fontWeight: '700', color: C.white },
});
