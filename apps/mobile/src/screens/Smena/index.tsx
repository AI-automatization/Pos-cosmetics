import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useShiftStore } from '../../store/shiftStore';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:       '#F5F5F7',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  secondary:'#6B7280',
  border:   '#F3F4F6',
  primary:  '#5B5BD6',
  green:    '#10B981',
  red:      '#EF4444',
  orange:   '#F59E0B',
};

// ─── Types ─────────────────────────────────────────────
interface ShiftRecord {
  id: string;
  cashier: string;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  closingCash: number | null;
  totalRevenue: number;
  totalOrders: number;
  cashAmount: number;
  cardAmount: number;
  nasiyaAmount: number;
  expenses: number;
}

// ─── Mock data ─────────────────────────────────────────
const ACTIVE_SHIFT: ShiftRecord = {
  id: 'shift-001',
  cashier: 'Azamat Akhmedov',
  openedAt: '08:30',
  closedAt: null,
  openingCash: 500_000,
  closingCash: null,
  totalRevenue: 4_200_000,
  totalOrders: 48,
  cashAmount: 2_100_000,
  cardAmount: 1_750_000,
  nasiyaAmount: 350_000,
  expenses: 120_000,
};

const SHIFT_HISTORY: ShiftRecord[] = [
  {
    id: 'shift-000',
    cashier: 'Azamat Akhmedov',
    openedAt: '08:15',
    closedAt: '18:00',
    openingCash: 500_000,
    closingCash: 2_350_000,
    totalRevenue: 3_850_000,
    totalOrders: 42,
    cashAmount: 1_900_000,
    cardAmount: 1_500_000,
    nasiyaAmount: 450_000,
    expenses: 80_000,
  },
  {
    id: 'shift-prev1',
    cashier: 'Malika Yusupova',
    openedAt: '09:00',
    closedAt: '19:30',
    openingCash: 300_000,
    closingCash: 1_900_000,
    totalRevenue: 2_900_000,
    totalOrders: 31,
    cashAmount: 1_400_000,
    cardAmount: 1_100_000,
    nasiyaAmount: 400_000,
    expenses: 50_000,
  },
];

// ─── Utils ─────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

function duration(_openedAt: string): string {
  return '6 soat 12 daqiqa';
}

// ─── Stat box ──────────────────────────────────────────
function StatBox({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Detail row ────────────────────────────────────────
function DetailRow({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: string;
}) {
  return (
    <View style={styles.detailRow}>
      {icon ? (
        <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={16} color={C.muted} style={{ marginRight: 8 }} />
      ) : (
        <View style={styles.detailDot} />
      )}
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

// ─── History card ──────────────────────────────────────
function HistoryCard({ shift }: { shift: ShiftRecord }) {
  const netRevenue = shift.totalRevenue - shift.expenses;
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.historyDate}>{shift.openedAt} — {shift.closedAt}</Text>
          <Text style={styles.historyCashier}>{shift.cashier}</Text>
        </View>
        <View style={styles.historyBadge}>
          <Text style={styles.historyBadgeText}>Yopilgan</Text>
        </View>
      </View>
      <View style={styles.historyStats}>
        <View style={styles.historyStat}>
          <Text style={styles.historyStatValue}>{shift.totalOrders} ta</Text>
          <Text style={styles.historyStatLabel}>Savdolar</Text>
        </View>
        <View style={styles.historyDivider} />
        <View style={styles.historyStat}>
          <Text style={styles.historyStatValue}>{fmt(shift.totalRevenue)}</Text>
          <Text style={styles.historyStatLabel}>Tushum</Text>
        </View>
        <View style={styles.historyDivider} />
        <View style={styles.historyStat}>
          <Text style={[styles.historyStatValue, { color: C.green }]}>{fmt(netRevenue)}</Text>
          <Text style={styles.historyStatLabel}>Sof daromad</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function SmenaScreen() {
  const { isShiftOpen, openShift, closeShift } = useShiftStore();
  const [loading, setLoading]     = useState(false);

  const shift = isShiftOpen ? ACTIVE_SHIFT : null;
  const netRevenue = shift ? shift.totalRevenue - shift.expenses : 0;

  const handleToggleShift = () => {
    if (isShiftOpen) {
      Alert.alert(
        'Smenani yopish',
        'Joriy smenani yopmoqchimisiz?',
        [
          { text: 'Bekor', style: 'cancel' },
          {
            text: 'Yopish',
            style: 'destructive',
            onPress: () => {
              setLoading(true);
              setTimeout(() => { setLoading(false); closeShift(); }, 800);
            },
          },
        ],
      );
    } else {
      setLoading(true);
      setTimeout(() => { setLoading(false); openShift(); }, 800);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smena</Text>
          <Text style={styles.headerDate}>10 mart, 2026</Text>
        </View>
        <View style={[styles.statusPill, isShiftOpen ? styles.statusPillActive : styles.statusPillClosed]}>
          <View style={[styles.statusDot, { backgroundColor: isShiftOpen ? C.green : C.muted }]} />
          <Text style={[styles.statusText, { color: isShiftOpen ? C.green : C.muted }]}>
            {isShiftOpen ? 'Faol' : 'Yopilgan'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {isShiftOpen && shift ? (
          <>
            {/* Active shift card */}
            <View style={styles.shiftCard}>
              <View style={styles.shiftCardTop}>
                <View style={styles.shiftLeft}>
                  <View style={styles.shiftDot} />
                  <View>
                    <Text style={styles.shiftCashier}>{shift.cashier}</Text>
                    <Text style={styles.shiftTime}>Boshlandi: {shift.openedAt}  •  {duration(shift.openedAt)}</Text>
                  </View>
                </View>
                <View style={styles.shiftCashBox}>
                  <Text style={styles.shiftCashLabel}>Ochilish naqdi</Text>
                  <Text style={styles.shiftCashValue}>{fmt(shift.openingCash)}</Text>
                </View>
              </View>
            </View>

            {/* Quick stats grid */}
            <View style={styles.statsGrid}>
              <StatBox
                label="Tushum"
                value={`${fmt(shift.totalRevenue)} UZS`}
                icon="cash-register"
                iconBg={C.primary + '18'}
                iconColor={C.primary}
                sub={`${shift.totalOrders} ta savdo`}
              />
              <StatBox
                label="Naqd"
                value={`${fmt(shift.cashAmount)} UZS`}
                icon="cash-multiple"
                iconBg="#D1FAE5"
                iconColor={C.green}
              />
              <StatBox
                label="Karta"
                value={`${fmt(shift.cardAmount)} UZS`}
                icon="credit-card-outline"
                iconBg="#DBEAFE"
                iconColor="#2563EB"
              />
              <StatBox
                label="Nasiya"
                value={`${fmt(shift.nasiyaAmount)} UZS`}
                icon="receipt"
                iconBg="#FEF3C7"
                iconColor={C.orange}
              />
            </View>

            {/* Detailed report */}
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Batafsil hisobot</Text>

              <DetailRow
                label="Jami tushum"
                value={`${fmt(shift.totalRevenue)} UZS`}
                valueColor={C.primary}
                icon="cash-register"
              />
              <View style={styles.reportDivider} />
              <DetailRow
                label="Nasiya (kredit)"
                value={`${fmt(shift.nasiyaAmount)} UZS`}
                valueColor={C.orange}
                icon="receipt"
              />
              <DetailRow
                label="Xarajatlar"
                value={`− ${fmt(shift.expenses)} UZS`}
                valueColor={C.red}
                icon="minus-circle-outline"
              />
              <View style={styles.reportDivider} />
              <View style={styles.netRow}>
                <Text style={styles.netLabel}>Sof daromad</Text>
                <Text style={styles.netValue}>{fmt(netRevenue)} UZS</Text>
              </View>
            </View>
          </>
        ) : (
          /* No active shift */
          <View style={styles.noShift}>
            <View style={styles.noShiftIcon}>
              <MaterialCommunityIcons name="clock-outline" size={48} color={C.muted} />
            </View>
            <Text style={styles.noShiftTitle}>Faol smena yo'q</Text>
            <Text style={styles.noShiftSub}>Yangi smena boshlash uchun quyidagi tugmani bosing</Text>
          </View>
        )}

        {/* Shift history */}
        {SHIFT_HISTORY.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Oxirgi smenalar</Text>
            {SHIFT_HISTORY.map((s) => (
              <HistoryCard key={s.id} shift={s} />
            ))}
          </View>
        )}

      </ScrollView>

      {/* Open / Close button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.toggleBtn, isShiftOpen ? styles.toggleBtnClose : styles.toggleBtnOpen]}
          onPress={handleToggleShift}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <>
              <Ionicons
                name={isShiftOpen ? 'lock-closed-outline' : 'play-circle-outline'}
                size={22}
                color={C.white}
              />
              <Text style={styles.toggleBtnText}>
                {isShiftOpen ? 'Smenani yopish' : 'Smena ochish'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerDate: { fontSize: 12, color: C.muted, marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statusPillActive: { backgroundColor: '#D1FAE5' },
  statusPillClosed: { backgroundColor: C.border },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  scroll: { paddingBottom: 120, gap: 16, paddingTop: 16 },

  // Active shift card
  shiftCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderLeftWidth: 4, borderLeftColor: C.green,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  shiftCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shiftLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green },
  shiftCashier: { fontSize: 15, fontWeight: '700', color: C.text },
  shiftTime: { fontSize: 12, color: C.secondary, marginTop: 2 },
  shiftCashBox: { alignItems: 'flex-end' },
  shiftCashLabel: { fontSize: 11, color: C.muted },
  shiftCashValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 2 },

  // Stats grid (2x2)
  statsGrid: {
    marginHorizontal: 16,
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  statBox: {
    width: '47.5%',
    backgroundColor: C.white, borderRadius: 14,
    padding: 14, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  statSub: { fontSize: 11, color: C.secondary },

  // Detailed report
  reportCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    gap: 10,
  },
  reportTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 2 },
  reportDivider: { height: 1, backgroundColor: C.border },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted, marginRight: 10 },
  detailLabel: { flex: 1, fontSize: 14, color: C.secondary },
  detailValue: { fontSize: 14, fontWeight: '700', color: C.text },
  netRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  netLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  netValue: { fontSize: 18, fontWeight: '800', color: C.green },

  // No shift
  noShift: { alignItems: 'center', paddingVertical: 40, gap: 12, marginHorizontal: 16 },
  noShiftIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  noShiftTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  noShiftSub: { fontSize: 14, color: C.muted, textAlign: 'center' },

  // History
  historySection: { marginHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  historyCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    gap: 12,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyDate: { fontSize: 14, fontWeight: '700', color: C.text },
  historyCashier: { fontSize: 12, color: C.secondary, marginTop: 2 },
  historyBadge: { backgroundColor: C.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  historyBadgeText: { fontSize: 11, fontWeight: '700', color: C.secondary },
  historyStats: { flexDirection: 'row' },
  historyStat: { flex: 1, alignItems: 'center', gap: 3 },
  historyDivider: { width: 1, backgroundColor: C.border, marginVertical: 2 },
  historyStatValue: { fontSize: 13, fontWeight: '700', color: C.text },
  historyStatLabel: { fontSize: 11, color: C.muted },

  // Footer button
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 34,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, height: 54, gap: 10,
  },
  toggleBtnOpen: {
    backgroundColor: C.green,
    shadowColor: C.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  toggleBtnClose: {
    backgroundColor: C.red,
    shadowColor: C.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  toggleBtnText: { fontSize: 16, fontWeight: '800', color: C.white },
});
