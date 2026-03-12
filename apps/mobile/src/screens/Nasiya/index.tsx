import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:       '#F5F5F7',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  secondary:'#6B7280',
  border:   '#F3F4F6',
  primary:  '#5B5BD6',
  red:      '#EF4444',
  green:    '#10B981',
  orange:   '#F59E0B',
};

// ─── Types ─────────────────────────────────────────────
type TabKey    = 'ALL' | 'OVERDUE' | 'ACTIVE';
type DebtStatus = 'ACTIVE' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

interface DebtRecord {
  id: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  status: DebtStatus;
  dueDate: string;     // 'YYYY-MM-DD'
  lastPayment?: string;
}

// ─── Status config ─────────────────────────────────────
const STATUS_CFG: Record<DebtStatus, { bg: string; text: string; label: string }> = {
  ACTIVE:    { bg: '#EFF6FF', text: '#2563EB', label: 'Faol'              },
  PARTIAL:   { bg: '#FFF7ED', text: '#EA580C', label: 'Qisman to\'langan' },
  PAID:      { bg: '#D1FAE5', text: '#059669', label: 'To\'langan'        },
  OVERDUE:   { bg: '#FEE2E2', text: C.red,     label: "Muddati o'tgan"    },
  CANCELLED: { bg: '#F3F4F6', text: C.secondary, label: 'Bekor qilingan'  },
};

// ─── Mock data ─────────────────────────────────────────
const MOCK_DEBTS: DebtRecord[] = [
  {
    id: '1', customerName: 'Azamat Karimov',  phone: '+998 90 123 45 67',
    totalAmount: 350_000, paidAmount: 100_000, remaining: 250_000,
    status: 'OVERDUE',  dueDate: '2026-03-05', lastPayment: '2026-02-15',
  },
  {
    id: '2', customerName: 'Malika Yusupova', phone: '+998 93 456 78 90',
    totalAmount: 120_000, paidAmount: 0,       remaining: 120_000,
    status: 'ACTIVE',   dueDate: '2026-03-20',
  },
  {
    id: '3', customerName: 'Bobur Toshmatov', phone: '+998 91 234 56 78',
    totalAmount: 580_000, paidAmount: 280_000, remaining: 300_000,
    status: 'OVERDUE',  dueDate: '2026-03-01', lastPayment: '2026-02-01',
  },
  {
    id: '4', customerName: 'Nilufar Rahimova', phone: '+998 97 345 67 89',
    totalAmount: 95_000,  paidAmount: 50_000,  remaining: 45_000,
    status: 'PARTIAL',  dueDate: '2026-03-25', lastPayment: '2026-03-01',
  },
  {
    id: '5', customerName: 'Jamshid Nazarov', phone: '+998 94 567 89 01',
    totalAmount: 230_000, paidAmount: 230_000, remaining: 0,
    status: 'PAID',     dueDate: '2026-02-28', lastPayment: '2026-02-28',
  },
  {
    id: '6', customerName: 'Zulfiya Mirzayeva', phone: '+998 99 678 90 12',
    totalAmount: 410_000, paidAmount: 100_000, remaining: 310_000,
    status: 'OVERDUE',  dueDate: '2026-03-10', lastPayment: '2026-02-20',
  },
  {
    id: '7', customerName: 'Sherzod Alimov', phone: '+998 95 789 01 23',
    totalAmount: 180_000, paidAmount: 0,       remaining: 180_000,
    status: 'ACTIVE',   dueDate: '2026-04-01',
  },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL',     label: 'Hammasi'          },
  { key: 'OVERDUE', label: "Muddati o'tgan"   },
  { key: 'ACTIVE',  label: 'Faol'             },
];

// ─── Utils ─────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

function overdueDays(dueDate: string): number {
  const diff = Date.now() - new Date(dueDate).getTime();
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0;
}

// ─── Summary Card ──────────────────────────────────────
function SummaryCard({ debts }: { debts: DebtRecord[] }) {
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  const overdueDebts   = debts.filter((d) => d.status === 'OVERDUE');
  const overdueAmt     = overdueDebts.reduce((s, d) => s + d.remaining, 0);

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryMain}>
        <Text style={styles.summaryLabel}>Jami nasiya</Text>
        <Text style={styles.summaryAmount}>{fmt(totalRemaining)} UZS</Text>
        <Text style={styles.summaryCount}>{debts.length} ta mijoz</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryOverdue}>
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueBadgeText}>!</Text>
        </View>
        <View>
          <Text style={styles.overdueLabel}>Muddati o'tgan</Text>
          <Text style={styles.overdueAmount}>{fmt(overdueAmt)} UZS</Text>
          <Text style={styles.overdueCount}>{overdueDebts.length} ta</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Debt Card ─────────────────────────────────────────
function DebtCard({
  debt,
  onPay,
  onRemind,
  reminding,
}: {
  debt: DebtRecord;
  onPay: () => void;
  onRemind: () => void;
  reminding: boolean;
}) {
  const cfg      = STATUS_CFG[debt.status];
  const isPaid   = debt.status === 'PAID' || debt.status === 'CANCELLED';
  const days     = overdueDays(debt.dueDate);
  const isOverdue = debt.status === 'OVERDUE';

  return (
    <TouchableOpacity style={styles.debtCard} activeOpacity={0.75}>
      {/* Header */}
      <View style={styles.debtHeader}>
        <View style={styles.debtAvatar}>
          <Text style={styles.debtAvatarText}>{debt.customerName.charAt(0)}</Text>
        </View>
        <View style={styles.debtInfo}>
          <Text style={styles.debtName}>{debt.customerName}</Text>
          <Text style={styles.debtPhone}>{debt.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Amounts row */}
      <View style={styles.amountsRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Jami</Text>
          <Text style={styles.amountValue}>{fmt(debt.totalAmount)}</Text>
        </View>
        <View style={styles.amountDivider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>To'langan</Text>
          <Text style={[styles.amountValue, { color: C.green }]}>{fmt(debt.paidAmount)}</Text>
        </View>
        <View style={styles.amountDivider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Qolgan</Text>
          <Text style={[styles.amountValue, { color: isOverdue ? C.red : C.text, fontWeight: '800' }]}>
            {fmt(debt.remaining)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.debtFooter}>
        <Text style={[styles.debtDue, isOverdue && { color: C.red, fontWeight: '600' }]} numberOfLines={1}>
          Muddat: {debt.dueDate}
          {isOverdue && days > 0 ? `  •  ${days} kun o'tdi` : ''}
        </Text>
        {debt.lastPayment && (
          <Text style={styles.lastPayment}>So'nggi to'lov: {debt.lastPayment}</Text>
        )}

        {!isPaid && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.reminderBtn}
              onPress={onRemind}
              activeOpacity={0.8}
              disabled={reminding}
            >
              {reminding ? (
                <ActivityIndicator size="small" color={C.orange} />
              ) : (
                <>
                  <MaterialCommunityIcons name="bell-ring-outline" size={14} color={C.orange} />
                  <Text style={styles.reminderBtnText}>Eslatma</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.payBtn} onPress={onPay} activeOpacity={0.8}>
              <Text style={styles.payBtnText}>To'lov</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Payment Modal ──────────────────────────────────────
function PaymentModal({
  visible,
  debt,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  debt: DebtRecord | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount]   = useState('');
  const [loading, setLoading] = useState(false);

  // Reset on open
  React.useEffect(() => {
    if (visible && debt) {
      setAmount(String(debt.remaining));
    } else {
      setAmount('');
      setLoading(false);
    }
  }, [visible, debt]);

  if (!debt) return null;

  const amountNum = parseFloat(amount.replace(/\s/g, '')) || 0;

  const handleConfirm = async () => {
    if (amountNum <= 0) {
      Alert.alert('Xatolik', "To'lov summasi 0 dan katta bo'lishi kerak");
      return;
    }
    if (amountNum > debt.remaining) {
      Alert.alert('Xatolik', `Qoldiq qarzdan katta bo'la olmaydi: ${fmt(debt.remaining)} UZS`);
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onConfirm(amountNum);
    }, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              {/* Title */}
              <Text style={styles.modalTitle}>Nasiya to'lovi</Text>

              {/* Customer summary */}
              <View style={styles.modalCustomer}>
                <View style={styles.debtAvatar}>
                  <Text style={styles.debtAvatarText}>{debt.customerName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalCustomerName}>{debt.customerName}</Text>
                  <View style={styles.modalAmountRow}>
                    <Text style={styles.modalAmountLabel}>Qolgan qarz:</Text>
                    <Text style={styles.modalAmountRed}>{fmt(debt.remaining)} UZS</Text>
                  </View>
                  {debt.paidAmount > 0 && (
                    <View style={styles.modalAmountRow}>
                      <Text style={styles.modalAmountLabel}>To'langan:</Text>
                      <Text style={styles.modalAmountGreen}>{fmt(debt.paidAmount)} UZS</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Quick fill */}
              <View style={styles.quickRow}>
                {([0.25, 0.5, 1] as const).map((ratio) => {
                  const val = Math.round(debt.remaining * ratio);
                  return (
                    <TouchableOpacity
                      key={ratio}
                      style={[styles.quickBtn, ratio === 1 && { borderColor: C.primary }]}
                      onPress={() => setAmount(String(val))}
                    >
                      <Text style={[styles.quickBtnText, ratio === 1 && { color: C.primary }]}>
                        {ratio === 1 ? "To'liq" : `${ratio * 100}%`}
                      </Text>
                      <Text style={[styles.quickBtnAmt, ratio === 1 && { color: C.primary }]}>
                        {fmt(val)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Amount input */}
              <Text style={styles.inputLabel}>To'lov miqdori</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputField}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  textAlign="right"
                  editable={!loading}
                  autoFocus
                />
                <Text style={styles.inputSuffix}>UZS</Text>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelBtnText}>Bekor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, (loading || amountNum <= 0) && styles.confirmDisabled]}
                  onPress={handleConfirm}
                  disabled={loading || amountNum <= 0}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={C.white} size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
                      <Text style={styles.confirmText}>Tasdiqlash</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function NasiyaScreen() {
  const [activeTab, setActiveTab]         = useState<TabKey>('ALL');
  const [search, setSearch]               = useState('');
  const [selectedDebt, setSelectedDebt]   = useState<DebtRecord | null>(null);
  const [payVisible, setPayVisible]       = useState(false);
  const [remindingId, setRemindingId]     = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_DEBTS.filter((d) => {
      const matchSearch = d.customerName.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search);
      if (activeTab === 'OVERDUE') return matchSearch && d.status === 'OVERDUE';
      if (activeTab === 'ACTIVE')  return matchSearch && (d.status === 'ACTIVE' || d.status === 'PARTIAL');
      return matchSearch;
    });
  }, [search, activeTab]);

  const handlePay = (debt: DebtRecord) => {
    setSelectedDebt(debt);
    setPayVisible(true);
  };

  const handleRemind = (debt: DebtRecord) => {
    setRemindingId(debt.id);
    // Simulate sending reminder
    setTimeout(() => {
      setRemindingId(null);
      Alert.alert('✅', `${debt.customerName} ga eslatma yuborildi`);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nasiya</Text>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Ionicons name="filter-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Summary card */}
            <SummaryCard debts={MOCK_DEBTS} />

            {/* Search */}
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color={C.muted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Mijoz qidirish..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={16} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.resultCount}>{filtered.length} ta natija</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DebtCard
            debt={item}
            onPay={() => handlePay(item)}
            onRemind={() => handleRemind(item)}
            reminding={remindingId === item.id}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-off-outline" size={48} color={C.muted} />
            <Text style={styles.emptyText}>Nasiya topilmadi</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={C.white} />
      </TouchableOpacity>

      {/* Payment Modal */}
      <PaymentModal
        visible={payVisible}
        debt={selectedDebt}
        onClose={() => setPayVisible(false)}
        onConfirm={(_amount) => setPayVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },

  // List
  content: { paddingBottom: 100 },
  listHeader: { gap: 12, paddingBottom: 4 },

  // Summary card (purple)
  summaryCard: {
    margin: 16, marginBottom: 0,
    backgroundColor: C.primary,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  summaryMain: { flex: 1 },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  summaryAmount: { fontSize: 22, fontWeight: '800', color: C.white, marginTop: 4 },
  summaryCount: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  summaryDivider: { width: 1, height: 60, backgroundColor: 'rgba(255,255,255,0.2)' },
  summaryOverdue: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  overdueBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  overdueBadgeText: { color: '#FECACA', fontSize: 14, fontWeight: '800' },
  overdueLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  overdueAmount: { fontSize: 14, fontWeight: '700', color: C.white },
  overdueCount: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    marginHorizontal: 16, borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // Tabs
  tabsRow: { paddingHorizontal: 16, gap: 8 },
  tab: {
    height: 36, paddingHorizontal: 18, borderRadius: 18,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: C.primary, borderColor: C.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: C.secondary },
  tabTextActive: { color: C.white },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16, paddingTop: 4 },

  // Debt card
  debtCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    marginHorizontal: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  debtHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  debtAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  debtAvatarText: { fontSize: 16, fontWeight: '700', color: C.primary },
  debtInfo: { flex: 1 },
  debtName: { fontSize: 15, fontWeight: '700', color: C.text },
  debtPhone: { fontSize: 12, color: C.secondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },

  // Amounts row
  amountsRow: {
    flexDirection: 'row', backgroundColor: C.bg,
    borderRadius: 10, paddingVertical: 10,
  },
  amountItem: { flex: 1, alignItems: 'center', gap: 3 },
  amountDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },
  amountLabel: { fontSize: 11, color: C.muted, fontWeight: '500' },
  amountValue: { fontSize: 13, fontWeight: '700', color: C.text },

  // Footer
  debtFooter: { gap: 8 },
  debtDue: { fontSize: 12, color: C.secondary },
  lastPayment: { fontSize: 11, color: C.muted },
  btnRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  reminderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: C.orange, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6, minWidth: 40,
  },
  reminderBtnText: { fontSize: 12, fontWeight: '700', color: C.orange },
  payBtn: {
    backgroundColor: C.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  payBtnText: { fontSize: 12, fontWeight: '700', color: C.white },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },

  // Modal
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalWrapper: { width: '100%' },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 34,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: C.border, alignSelf: 'center',
    marginTop: 12, marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 16 },
  modalCustomer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 16,
  },
  modalCustomerName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  modalAmountRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 },
  modalAmountLabel: { fontSize: 12, color: C.secondary },
  modalAmountRed: { fontSize: 13, fontWeight: '700', color: C.red },
  modalAmountGreen: { fontSize: 13, fontWeight: '600', color: C.green },

  // Quick fill
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, gap: 2,
  },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: C.secondary },
  quickBtnAmt: { fontSize: 10, color: C.muted },

  // Input
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 16, height: 52,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  inputField: { flex: 1, fontSize: 20, fontWeight: '700', color: C.text },
  inputSuffix: { fontSize: 14, fontWeight: '600', color: C.muted, marginLeft: 8 },

  // Modal actions
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: C.secondary },
  confirmBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 14, height: 54, gap: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
