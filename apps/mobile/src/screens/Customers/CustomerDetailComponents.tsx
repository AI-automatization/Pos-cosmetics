import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DebtRecord } from '../../api/nasiya.api';
import { AgeBadge } from './AgeBadge';

// ─── Colors (shared with main screen) ─────────────────
const C = {
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  border:   '#E5E7EB',
  primary:  '#2563EB',
  red:      '#DC2626',
  avatarBg: '#EFF6FF',
};

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

// ─── DebtItem ──────────────────────────────────────────
interface DebtItemProps {
  readonly debt: DebtRecord;
  readonly onPay: (debt: DebtRecord) => void;
}

export function DebtItem({ debt, onPay }: DebtItemProps) {
  return (
    <View style={debtItemStyles.card}>
      <View style={debtItemStyles.topRow}>
        <AgeBadge dueDate={debt.dueDate} />
        <View style={debtItemStyles.remainingWrap}>
          <Text style={debtItemStyles.remainingLabel}>Qolgan: </Text>
          <Text style={debtItemStyles.remainingValue}>{fmt(Number(debt.remaining))}</Text>
        </View>
        <TouchableOpacity
          style={debtItemStyles.payBtn}
          onPress={() => onPay(debt)}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={debtItemStyles.payBtnText}>To'lash</Text>
          <Ionicons name="chevron-forward" size={12} color="#2563EB" />
        </TouchableOpacity>
      </View>
      <View style={debtItemStyles.bottomRow}>
        <Text style={debtItemStyles.meta}>Jami: {fmt(Number(debt.totalAmount))}</Text>
        <Text style={debtItemStyles.metaDot}> · </Text>
        <Text style={debtItemStyles.meta}>Muddat: {fmtDate(debt.dueDate)}</Text>
      </View>
    </View>
  );
}

const debtItemStyles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remainingWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },
  remainingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.red,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    minWidth: 48,
    minHeight: 48 / 2,
  },
  payBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: C.muted,
  },
  metaDot: {
    fontSize: 12,
    color: C.muted,
  },
});

// ─── InfoRow ───────────────────────────────────────────
interface InfoRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  valueColor?: string;
}

export function InfoRow({ icon, label, value, valueColor }: InfoRowProps) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={C.primary} />
      </View>
      <View style={infoStyles.body}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={[infoStyles.value, valueColor ? { color: valueColor } : undefined]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, letterSpacing: 0.3 },
  value: { fontSize: 15, fontWeight: '500', color: C.text, marginTop: 1 },
});

// ─── StatCard ──────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  accent?: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, accent ? { color: accent } : undefined]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
});
