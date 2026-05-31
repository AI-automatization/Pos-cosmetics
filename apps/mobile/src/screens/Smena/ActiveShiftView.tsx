import React from 'react';
import { View, Text } from 'react-native';
import { C, ShiftRecord, fmt, StatBox, DetailRow } from './SmenaComponents';
import { duration } from './useSmenaData';
import { styles } from './styles';

// ─── Util ──────────────────────────────────────────────
function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '\u2014';
  return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

// ─── Types ─────────────────────────────────────────────
interface ActiveShiftViewProps {
  readonly shift: ShiftRecord;
  readonly shiftDetail: {
    readonly openedAt: string | Date;
    readonly openingCash?: number | null;
  };
  readonly cashierName: string;
}

// ─── Component ─────────────────────────────────────────
export default function ActiveShiftView({
  shift,
  shiftDetail,
  cashierName,
}: ActiveShiftViewProps) {
  const netRevenue = shift.totalRevenue - shift.expenses;

  return (
    <>
      {/* Active shift card */}
      <View style={styles.shiftCard}>
        <View style={styles.shiftCardTop}>
          <View style={styles.shiftLeft}>
            <View style={styles.shiftDot} />
            <View>
              <Text style={styles.shiftCashier}>
                {shift.cashier ?? cashierName}
              </Text>
              <Text style={styles.shiftTime}>
                Boshlandi: {formatTime(shiftDetail.openedAt)}  {'\u2022'}  {duration(shiftDetail.openedAt)}
              </Text>
            </View>
          </View>
          <View style={styles.shiftCashBox}>
            <Text style={styles.shiftCashLabel}>Ochilish naqdi</Text>
            <Text style={styles.shiftCashValue}>
              {fmt(Number(shiftDetail.openingCash ?? 0))}
            </Text>
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
          value={`\u2212 ${fmt(shift.expenses)} UZS`}
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
  );
}
