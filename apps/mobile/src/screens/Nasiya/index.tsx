import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { DebtRecord } from '../../api/nasiya.api';
import type { SavdoStackParamList } from '../../navigation/types';
import { useNasiyaData, FilterTab } from './useNasiyaData';
import DebtCard from './DebtCard';
import PayModal from './PayModal';
import NewDebtSheet from './NewDebtSheet';
import DebtDetailSheet from './DebtDetailSheet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ShiftGuard from '../../components/common/ShiftGuard';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#E5E7EB',
  primary:   '#2563EB',
  red:       '#DC2626',
};

// ─── Tabs ──────────────────────────────────────────────
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',     label: 'Barchasi'        },
  { key: 'ACTIVE',  label: 'Faol'            },
  { key: 'OVERDUE', label: "Muddati o'tgan"  },
  { key: 'PAID',    label: "To'langan"       },
];

// ─── Utils ─────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

// ─── Summary Card ──────────────────────────────────────
function SummaryCard({
  totalDebt,
  overdueCount,
  overdueAmount,
  totalCount,
}: {
  totalDebt: number;
  overdueCount: number;
  overdueAmount: number;
  totalCount: number;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryMain}>
        <Text style={styles.summaryLabel}>Jami nasiya</Text>
        <Text style={styles.summaryAmount}>{fmt(totalDebt)} UZS</Text>
        <Text style={styles.summaryCount}>{totalCount} ta mijoz</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryOverdue}>
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueBadgeText}>!</Text>
        </View>
        <View>
          <Text style={styles.overdueLabel}>Muddati o'tgan</Text>
          <Text style={styles.overdueAmount}>{fmt(overdueAmount)} UZS</Text>
          <Text style={styles.overdueCount}>{overdueCount} ta</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function NasiyaScreen() {
  const [activeTab, setActiveTab]           = useState<FilterTab>('ALL');
  const [search, setSearch]                 = useState('');
  const [selectedDebt, setSelectedDebt]     = useState<DebtRecord | null>(null);
  const [payVisible, setPayVisible]         = useState(false);
  const [newDebtVisible, setNewDebtVisible] = useState(false);
  const [detailDebt, setDetailDebt]         = useState<DebtRecord | null>(null);
  const [detailVisible, setDetailVisible]   = useState(false);

  const route = useRoute<RouteProp<SavdoStackParamList, 'NasiyaScreen'>>();
  const navigation = useNavigation<NativeStackNavigationProp<SavdoStackParamList>>();

  // Auto-open from Savdo NASIYA payment
  useEffect(() => {
    const params = route.params;
    if (params?.openNewDebt) {
      setNewDebtVisible(true);
      // Clear params so re-navigation does not re-trigger the sheet
      navigation.setParams({ openNewDebt: undefined, amount: undefined, products: undefined });
    }
  }, [route.params, navigation]);

  const {
    currentItems,
    totalDebt,
    overdueCount,
    overdueAmount,
    isLoading,
    refetchAll,
  } = useNasiyaData(activeTab);

  const filtered = currentItems.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.customer.name.toLowerCase().includes(q) ||
      (d.customer.phone ?? '').includes(search)
    );
  });

  const handlePay = (debt: DebtRecord) => {
    setSelectedDebt(debt);
    setPayVisible(true);
  };

  const handleDebtPress = (debt: DebtRecord) => {
    setDetailDebt(debt);
    setDetailVisible(true);
  };

  const handlePaySuccess = () => {
    refetchAll();
  };

  return (
    <ShiftGuard>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nasiya</Text>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Ionicons name="filter-outline" size={20} color={C.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Summary card */}
              <SummaryCard
                totalDebt={totalDebt}
                overdueCount={overdueCount}
                overdueAmount={overdueAmount}
                totalCount={currentItems.length}
              />

              {/* Search */}
              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={16} color={C.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Xaridor ismi..."
                  placeholderTextColor={C.muted}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={16} color={C.muted} />
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
              onPay={handlePay}
              onPress={handleDebtPress}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>Nasiya topilmadi</Text>
            </View>
          }
        />
      )}

      {/* FAB — yangi nasiya */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setNewDebtVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={C.white} />
      </TouchableOpacity>

      {/* Payment Modal */}
      <PayModal
        visible={payVisible}
        debt={selectedDebt}
        onClose={() => setPayVisible(false)}
        onSuccess={handlePaySuccess}
      />

      {/* New Debt Sheet */}
      <NewDebtSheet
        visible={newDebtVisible}
        onClose={() => setNewDebtVisible(false)}
        onSuccess={() => { setNewDebtVisible(false); refetchAll(); }}
        initialAmount={(route.params as SavdoStackParamList['NasiyaScreen'])?.amount}
        initialProducts={(route.params as SavdoStackParamList['NasiyaScreen'])?.products}
      />

      {/* Debt Detail Sheet */}
      <DebtDetailSheet
        visible={detailVisible}
        debt={detailDebt}
        onClose={() => setDetailVisible(false)}
        onPay={(debt) => { setDetailVisible(false); handlePay(debt); }}
      />
    </SafeAreaView>
    </ShiftGuard>
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },

  // List
  content: { paddingBottom: 100 },
  listHeader: { gap: 12, paddingBottom: 4 },
  separator: { height: 10 },

  // Summary card (blue)
  summaryCard: {
    margin: 16, marginBottom: 0,
    backgroundColor: '#2563EB',
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
    backgroundColor: 'rgba(220,38,38,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  overdueBadgeText: { color: '#FECACA', fontSize: 14, fontWeight: '800' },
  overdueLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  overdueAmount: { fontSize: 14, fontWeight: '700', color: C.white },
  overdueCount: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    marginHorizontal: 16, borderWidth: 1, borderColor: C.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // Tabs
  tabsRow: { paddingHorizontal: 16, gap: 8 },
  tab: {
    height: 36, paddingHorizontal: 18, borderRadius: 18,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: C.secondary },
  tabTextActive: { color: C.white },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16, paddingTop: 4 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24, right: 20,
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
