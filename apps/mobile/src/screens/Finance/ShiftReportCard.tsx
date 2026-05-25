import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ShiftDetail } from '../../api/sales.api';
import { C, fmt, fmtShort, formatDate, formatTime, duration, cashierName } from './shift-reports.utils';
import { styles } from './ShiftReportsScreen.styles';

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

export default function ShiftReportCard({ shift, index }: { shift: ShiftDetail; index: number }) {
  const isOpen   = shift.status?.toUpperCase() === 'OPEN';
  const dur      = duration(shift.openedAt, shift.closedAt);
  const cashier  = cashierName(shift);

  const pb: any = (shift as any).paymentBreakdown ?? {};
  const cashAmt   = shift.cashAmount  ?? pb.cash  ?? pb.CASH  ?? 0;
  const cardAmt   = shift.cardAmount  ?? pb.card  ?? pb.CARD  ?? pb.terminal ?? 0;
  const nasiyaAmt = shift.nasiyaAmount ?? pb.nasiya ?? pb.NASIYA ?? pb.credit ?? 0;

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.shiftNumBox, isOpen ? styles.shiftNumOpen : styles.shiftNumClosed]}>
            <Text style={[styles.shiftNum, { color: isOpen ? C.green : C.muted }]}>
              #{index + 1}
            </Text>
          </View>
          <View>
            <Text style={styles.cardDate}>{formatDate(shift.openedAt)}</Text>
            <Text style={styles.cardTime}>
              {formatTime(shift.openedAt)}
              {shift.closedAt ? ` — ${formatTime(shift.closedAt)}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
            <Text style={[styles.statusText, { color: isOpen ? C.green : C.muted }]}>
              {isOpen ? 'Ochiq' : 'Yopildi'}
            </Text>
          </View>
          <Text style={styles.durText}>{dur}</Text>
        </View>
      </View>

      {/* Cashier */}
      <View style={styles.cashierRow}>
        <Ionicons name="person-outline" size={13} color={C.muted} />
        <Text style={styles.cashierName}>{cashier}</Text>
      </View>

      <View style={styles.divider} />

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCell label="Buyurtmalar" value={shift.totalOrders ? `${shift.totalOrders} ta` : '—'} />
        <StatCell label="Naqd" value={fmtShort(cashAmt || undefined)} color={C.green} />
        <StatCell label="Karta" value={fmtShort(cardAmt || undefined)} color={C.primary} />
        <StatCell label="Nasiya" value={fmtShort(nasiyaAmt || undefined)} color={C.orange} />
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Jami tushum</Text>
        <Text style={styles.totalValue}>{fmt(shift.totalRevenue)}</Text>
      </View>
    </View>
  );
}
