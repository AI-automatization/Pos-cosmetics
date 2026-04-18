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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nasiyaApi, type DebtRecord } from '../../api/nasiya.api';

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
  yellow:  '#CA8A04',
};

// ─── Debt age badge ────────────────────────────────────
type AgeBucket = 'joriy' | '0-30' | '31-60' | '61-90' | '90+';

function getAgeBucket(dueDate: string | null): AgeBucket {
  if (!dueDate) return 'joriy';
  const due   = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
  if (diffDays <= 0)  return 'joriy';
  if (diffDays <= 30) return '0-30';
  if (diffDays <= 60) return '31-60';
  if (diffDays <= 90) return '61-90';
  return '90+';
}

const AGE_STYLE: Record<AgeBucket, { label: string; color: string; bg: string }> = {
  'joriy': { label: 'Joriy',    color: C.green,              bg: '#F0FDF4' },
  '0-30':  { label: '0–30 kun', color: C.yellow,             bg: '#FEFCE8' },
  '31-60': { label: '31–60 kun',color: C.orange,             bg: '#FFFBEB' },
  '61-90': { label: '61–90 kun',color: C.red,                bg: '#FEF2F2' },
  '90+':   { label: '90+ kun',  color: '#7F1D1D',            bg: '#FEE2E2' },
};

type PayMethod = 'Naqd' | 'Karta' | 'Transfer';
const PAY_METHODS: PayMethod[] = ['Naqd', 'Karta', 'Transfer'];

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}
function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

// ─── QuickPaySheet ─────────────────────────────────────
function QuickPaySheet({
  record,
  onClose,
  onPaid,
}: {
  record: DebtRecord | null;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [amount, setAmount]     = useState('');
  const [method, setMethod]     = useState<PayMethod>('Naqd');
  const [loading, setLoading]   = useState(false);
  const visible = !!record;

  React.useEffect(() => {
    if (visible) setAmount('');
  }, [visible]);

  if (!record) return null;
  const remaining = record.remaining;

  const handleQuick = (pct: number) => {
    setAmount(String(Math.round(remaining * pct)));
  };

  const handleMethodPick = () => {
    Alert.alert("To'lov usuli", undefined, [
      ...PAY_METHODS.map((m) => ({ text: m, onPress: () => setMethod(m) })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handlePay = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (amt > remaining) {
      Alert.alert('Xatolik', 'Miqdor qarzdan ko\'p bo\'lishi mumkin emas');
      return;
    }
    Alert.alert(
      'Tasdiqlash',
      `${fmt(amt)} to'lansinmi?`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "To'lash",
          onPress: async () => {
            setLoading(true);
            try {
              await nasiyaApi.recordPayment({
                debtorId: record.id,
                amount: amt,
                paymentMethod: method,
              });
              onPaid();
              onClose();
            } catch {
              Alert.alert('Xatolik', 'To\'lovni amalga oshirib bo\'lmadi');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const canPay = parseFloat(amount) > 0 && !loading;

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
            <View style={sheet.iconCircle}>
              <Ionicons name="cash-outline" size={22} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sheet.title}>{record.customer.name}</Text>
              <Text style={sheet.subtitle}>Qolgan qarz: {fmt(remaining)}</Text>
            </View>
          </View>

          {/* Amount input */}
          <Text style={sheet.label}>MIQDOR (UZS)</Text>
          <TextInput
            style={sheet.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
          />

          {/* Quick buttons */}
          <View style={sheet.quickRow}>
            <TouchableOpacity
              style={sheet.quickBtn}
              onPress={() => handleQuick(0.5)}
              activeOpacity={0.75}
            >
              <Text style={sheet.quickBtnText}>50%</Text>
              <Text style={sheet.quickBtnSub}>{fmt(Math.round(remaining * 0.5))}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sheet.quickBtn, sheet.quickBtnFull]}
              onPress={() => handleQuick(1)}
              activeOpacity={0.75}
            >
              <Text style={[sheet.quickBtnText, { color: C.white }]}>To'liq</Text>
              <Text style={[sheet.quickBtnSub, { color: C.white + 'CC' }]}>{fmt(remaining)}</Text>
            </TouchableOpacity>
          </View>

          {/* Payment method */}
          <Text style={sheet.label}>TO'LOV USULI</Text>
          <TouchableOpacity style={sheet.selectRow} onPress={handleMethodPick}>
            <Ionicons name="card-outline" size={18} color={C.muted} />
            <Text style={sheet.selectText}>{method}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[sheet.payBtn, !canPay && sheet.payBtnDisabled]}
            onPress={handlePay}
            activeOpacity={0.85}
            disabled={!canPay}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.payBtnText}>To'lashni tasdiqlash</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── DebtCard ──────────────────────────────────────────
function DebtCard({
  record,
  onPay,
}: {
  record: DebtRecord;
  onPay: (r: DebtRecord) => void;
}) {
  const bucket = getAgeBucket(record.dueDate);
  const age    = AGE_STYLE[bucket];

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {/* Customer info */}
        <View style={styles.customerCol}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {record.customer.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName} numberOfLines={1}>{record.customer.name}</Text>
            {record.customer.phone && (
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={11} color={C.muted} />
                <Text style={styles.phoneText}>{record.customer.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Age badge */}
        <View style={[styles.ageBadge, { backgroundColor: age.bg }]}>
          <Text style={[styles.ageBadgeText, { color: age.color }]}>{age.label}</Text>
        </View>
      </View>

      <View style={styles.cardMid}>
        {/* Due date */}
        {record.dueDate && (
          <View style={styles.dueDateRow}>
            <Ionicons name="calendar-outline" size={12} color={C.muted} />
            <Text style={styles.dueDateText}>Muddat: {record.dueDate}</Text>
          </View>
        )}

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, Math.round((record.paidAmount / record.totalAmount) * 100))}%` as `${number}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.paidText}>To'landi: {fmt(record.paidAmount)}</Text>
          <Text style={styles.totalText}>{fmt(record.totalAmount)}</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.remainLabel}>Qolgan qarz</Text>
          <Text style={styles.remainValue}>{fmt(record.remaining)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => onPay(record)}
          activeOpacity={0.8}
        >
          <Ionicons name="cash-outline" size={15} color={C.white} />
          <Text style={styles.payBtnText}>To'lash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── NasiyaAgingScreen ─────────────────────────────────
type TabKey = 'all' | 'overdue';

interface Props {
  onClose?: () => void;
}

export default function NasiyaAgingScreen({ onClose }: Props) {
  const [tab, setTab]           = useState<TabKey>('all');
  const [payRecord, setPayRecord] = useState<DebtRecord | null>(null);
  const queryClient             = useQueryClient();

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['nasiya-list'],
    queryFn: () => nasiyaApi.getList(),
    staleTime: 2 * 60_000,
  });

  const { data: overdueData, isLoading: overdueLoading } = useQuery({
    queryKey: ['nasiya-overdue'],
    queryFn: () => nasiyaApi.getOverdue(),
    staleTime: 2 * 60_000,
  });

  const allRecords     = allData?.items ?? [];
  const overdueRecords = overdueData ?? [];

  const displayed = tab === 'all' ? allRecords : overdueRecords;
  const isLoading  = tab === 'all' ? allLoading : overdueLoading;

  // Summary stats
  const totalDebt    = allRecords.reduce((s, r) => s + r.remaining, 0);
  const overdueAmt   = overdueRecords.reduce((s, r) => s + r.remaining, 0);
  const thisMonth    = useMemo(() => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!;
    return allRecords
      .filter((r) => r.dueDate && r.dueDate >= start)
      .reduce((s, r) => s + r.remaining, 0);
  }, [allRecords]);
  const customerCount = new Set(allRecords.map((r) => r.customerId)).size;

  const handlePaid = () => {
    void queryClient.invalidateQueries({ queryKey: ['nasiya-list'] });
    void queryClient.invalidateQueries({ queryKey: ['nasiya-overdue'] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {onClose ? (
          <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
        ) : <View style={styles.headerBtn} />}
        <Text style={styles.headerTitle}>Nasiya qarzdorlik</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary cards (horizontal scroll) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryScroll}
      >
        {[
          { label: 'Jami qarz',       value: fmtShort(totalDebt),    color: C.text,   bg: C.white   },
          { label: "Muddati o'tgan",  value: fmtShort(overdueAmt),   color: C.red,    bg: '#FEF2F2' },
          { label: 'Bu oy',           value: fmtShort(thisMonth),    color: C.orange, bg: '#FFFBEB' },
          { label: 'Xaridorlar',      value: `${customerCount} ta`,  color: C.primary,bg: '#EFF6FF' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
            <Text style={styles.summaryLabel}>{s.label}</Text>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'overdue'] as TabKey[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? 'Barchasi' : "Muddati o'tgan"}
            </Text>
            {t === 'overdue' && overdueRecords.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{overdueRecords.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <DebtCard record={item} onPay={setPayRecord} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={44} color={C.green} />
              <Text style={styles.emptyTitle}>
                {tab === 'overdue' ? "Muddati o'tgan nasiyalar yo'q" : "Nasiyalar yo'q"}
              </Text>
            </View>
          }
        />
      )}

      <QuickPaySheet
        record={payRecord}
        onClose={() => setPayRecord(null)}
        onPaid={handlePaid}
      />
    </SafeAreaView>
  );
}

// ─── Sheet styles ───────────────────────────────────────
const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#DC2626', fontWeight: '600', marginTop: 2 },
  label: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1, marginBottom: 6,
  },
  input: {
    height: 52, backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, fontSize: 18, fontWeight: '700', color: '#111827',
    marginBottom: 12,
  },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', paddingVertical: 10, alignItems: 'center',
  },
  quickBtnFull: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  quickBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  quickBtnSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  selectRow: {
    height: 48, backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, marginBottom: 16,
  },
  selectText: { flex: 1, fontSize: 15, color: '#111827' },
  payBtn: {
    backgroundColor: '#2563EB', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  payBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Screen styles ──────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },

  summaryScroll: {
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  summaryCard: {
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 12, minWidth: 120,
  },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '800' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 6,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.primary },
  tabBadge: {
    backgroundColor: C.red, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabBadgeText: { fontSize: 11, fontWeight: '800', color: C.white },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 12 },

  card: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 12,
  },
  customerCol: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: C.primary },
  customerName: { fontSize: 15, fontWeight: '700', color: C.text },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  phoneText: { fontSize: 12, color: C.muted },

  ageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ageBadgeText: { fontSize: 11, fontWeight: '700' },

  cardMid: { marginBottom: 12 },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  dueDateText: { fontSize: 12, color: C.muted },
  progressTrack: {
    height: 6, borderRadius: 3,
    backgroundColor: C.border, marginBottom: 4,
  },
  progressBar: {
    height: 6, borderRadius: 3,
    backgroundColor: C.green,
  },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  paidText: { fontSize: 11, color: C.green, fontWeight: '600' },
  totalText: { fontSize: 11, color: C.muted },

  cardBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12,
  },
  remainLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  remainValue: { fontSize: 17, fontWeight: '800', color: C.red, marginTop: 2 },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  payBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
