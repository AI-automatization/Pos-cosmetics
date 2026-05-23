import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DebtRecord } from '../../api/nasiya.api';

// ─── Colors ────────────────────────────────────────────
const C = {
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
  '0-30':  { label: '0\u201330 kun', color: C.yellow,        bg: '#FEFCE8' },
  '31-60': { label: '31\u201360 kun',color: C.orange,        bg: '#FFFBEB' },
  '61-90': { label: '61\u201390 kun',color: C.red,           bg: '#FEF2F2' },
  '90+':   { label: '90+ kun',  color: '#7F1D1D',            bg: '#FEE2E2' },
};

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

interface NasiyaDebtCardProps {
  readonly record: DebtRecord;
  readonly onPay: (r: DebtRecord) => void;
}

export default function NasiyaDebtCard({ record, onPay }: NasiyaDebtCardProps) {
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
          <View style={styles.flex1}>
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
                width: `${Math.min(100, Math.round((Number(record.paidAmount) / Number(record.totalAmount)) * 100))}%` as `${number}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.paidText}>To'landi: {fmt(Number(record.paidAmount))}</Text>
          <Text style={styles.totalText}>{fmt(Number(record.totalAmount))}</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.remainLabel}>Qolgan qarz</Text>
          <Text style={styles.remainValue}>{fmt(Number(record.remaining))}</Text>
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

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  flex1: { flex: 1 },

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
});
