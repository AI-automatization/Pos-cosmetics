import React, { useEffect, useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { useShiftStore } from '../../store/shiftStore';
import { useAuthStore } from '../../store/auth.store';
import { salesApi } from '../../api/sales.api';
import { C, ShiftRecord, fmt, StatBox, DetailRow, HistoryCard } from './SmenaComponents';
import SmenaOpenSheet from './SmenaOpenSheet';
import SmenaCloseSheet from './SmenaCloseSheet';

// ─── Utils ─────────────────────────────────────────────
function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function duration(openedAt: Date | string): string {
  const diffMs = Date.now() - new Date(openedAt).getTime();
  const totalMins = Math.floor(diffMs / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m} daqiqa`;
  return `${h} soat ${m} daqiqa`;
}

// ─── Main Screen ───────────────────────────────────────
export default function SmenaScreen() {
  const { isShiftOpen, shiftId, openShift, closeShift, syncWithApi } = useShiftStore();
  const { user } = useAuthStore();
  const [loading, setLoading]         = useState(false);
  const [openSheetVisible, setOpenSheetVisible]   = useState(false);
  const [closeSheetVisible, setCloseSheetVisible] = useState(false);

  const cashierName = user ? `${user.firstName} ${user.lastName}` : 'Kassir';

  // App ochilganda API bilan sinxronlashtirish
  useEffect(() => {
    void syncWithApi();
  }, []);

  // Joriy smena detallari
  const { data: shiftDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['shift-detail', shiftId],
    queryFn: () => salesApi.getShiftById(shiftId!),
    enabled: !!shiftId && isShiftOpen,
    staleTime: 30_000,
  });

  // Smena tarixi
  const { data: shiftsData } = useQuery({
    queryKey: ['shifts-history'],
    queryFn: () => salesApi.getShifts(1, 6),
    staleTime: 60_000,
  });

  // API ma'lumotlarini ShiftRecord ga map qilish
  const shift: ShiftRecord | null =
    isShiftOpen && shiftDetail
      ? {
          id: shiftDetail.id,
          cashier:
            shiftDetail.user
              ? `${shiftDetail.user.firstName} ${shiftDetail.user.lastName}`
              : cashierName,
          openedAt: formatTime(shiftDetail.openedAt),
          closedAt: shiftDetail.closedAt ? formatTime(shiftDetail.closedAt) : null,
          openingCash: shiftDetail.openingCash,
          closingCash: shiftDetail.closingCash ?? null,
          totalRevenue: shiftDetail.totalRevenue ?? 0,
          totalOrders: shiftDetail.totalOrders ?? 0,
          cashAmount: shiftDetail.cashAmount ?? 0,
          cardAmount: shiftDetail.cardAmount ?? 0,
          nasiyaAmount: shiftDetail.nasiyaAmount ?? 0,
          expenses: shiftDetail.expenses ?? 0,
        }
      : null;

  // Yopilgan smenalar tarixi
  const historyShifts: ShiftRecord[] = (shiftsData?.items ?? [])
    .filter((s) => s.status === 'CLOSED')
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      cashier:
        s.user
          ? `${s.user.firstName} ${s.user.lastName}`
          : cashierName,
      openedAt: formatTime(s.openedAt),
      closedAt: s.closedAt ? formatTime(s.closedAt) : null,
      openingCash: s.openingCash,
      closingCash: s.closingCash ?? null,
      totalRevenue: s.totalRevenue ?? 0,
      totalOrders: s.totalOrders ?? 0,
      cashAmount: s.cashAmount ?? 0,
      cardAmount: s.cardAmount ?? 0,
      nasiyaAmount: s.nasiyaAmount ?? 0,
      expenses: s.expenses ?? 0,
    }));

  const netRevenue = shift ? shift.totalRevenue - shift.expenses : 0;
  const todayStr = formatDate(new Date());

  const handleToggleShift = () => {
    if (isShiftOpen) {
      setCloseSheetVisible(true);
    } else {
      setOpenSheetVisible(true);
    }
  };

  const handleOpenConfirm = (openingCash: number) => {
    setLoading(true);
    openShift(openingCash)
      .then(() => {
        setOpenSheetVisible(false);
      })
      .catch((err: unknown) => {
        let msg = 'Smena ochishda xatolik yuz berdi';
        if (err && typeof err === 'object' && 'response' in err) {
          const resp = (err as { response?: { data?: { message?: string }; status?: number } }).response;
          const serverMsg = resp?.data?.message;
          if (serverMsg) {
            msg = Array.isArray(serverMsg) ? serverMsg.join('\n') : String(serverMsg);
          } else if (resp?.status) {
            msg = `Xatolik ${resp.status}: ${msg}`;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        Alert.alert('Xatolik', msg);
      })
      .finally(() => setLoading(false));
  };

  const handleCloseConfirm = async (actualCash: number) => {
    setLoading(true);
    try {
      await closeShift(actualCash);
      setCloseSheetVisible(false);
      void refetchDetail();
    } catch {
      Alert.alert('Xatolik', 'Smena yopishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smena</Text>
          <Text style={styles.headerDate}>{todayStr}</Text>
        </View>
        <View style={[styles.statusPill, isShiftOpen ? styles.statusPillActive : styles.statusPillClosed]}>
          <View style={[styles.statusDot, { backgroundColor: isShiftOpen ? C.green : C.muted }]} />
          <Text style={[styles.statusText, { color: isShiftOpen ? C.green : C.muted }]}>
            {isShiftOpen ? 'Faol' : 'Yopilgan'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {isShiftOpen && shiftDetail ? (
          <>
            {/* Active shift card */}
            <View style={styles.shiftCard}>
              <View style={styles.shiftCardTop}>
                <View style={styles.shiftLeft}>
                  <View style={styles.shiftDot} />
                  <View>
                    <Text style={styles.shiftCashier}>
                      {shift?.cashier ?? cashierName}
                    </Text>
                    <Text style={styles.shiftTime}>
                      Boshlandi: {formatTime(shiftDetail.openedAt)}  •  {duration(shiftDetail.openedAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.shiftCashBox}>
                  <Text style={styles.shiftCashLabel}>Ochilish naqdi</Text>
                  <Text style={styles.shiftCashValue}>{fmt(shiftDetail.openingCash)}</Text>
                </View>
              </View>
            </View>

            {/* Quick stats grid */}
            {shift && (
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
            )}

            {/* Detailed report */}
            {shift && (
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
            )}
          </>
        ) : isShiftOpen ? (
          /* Shift open but data loading */
          <View style={styles.noShift}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
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
        {historyShifts.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Oxirgi smenalar</Text>
            {historyShifts.map((s) => (
              <HistoryCard key={s.id} shift={s} />
            ))}
          </View>
        )}

      </ScrollView>

      <SmenaOpenSheet
        visible={openSheetVisible}
        loading={loading}
        onClose={() => setOpenSheetVisible(false)}
        onConfirm={handleOpenConfirm}
      />
      <SmenaCloseSheet
        visible={closeSheetVisible}
        loading={loading}
        shift={shift}
        onClose={() => setCloseSheetVisible(false)}
        onConfirm={(cash) => { void handleCloseConfirm(cash); }}
      />

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
    backgroundColor: '#F0FDF4', borderRadius: 14,
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
