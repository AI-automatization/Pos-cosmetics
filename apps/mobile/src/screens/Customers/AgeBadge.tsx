import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── Aging badge ───────────────────────────────────────
export type AgeBucket = 'joriy' | '0-30' | '31-60' | '61-90' | '90+';

export const AGE_STYLE: Record<AgeBucket, { label: string; color: string; bg: string }> = {
  'joriy':  { label: 'Joriy',      color: '#16A34A', bg: '#F0FDF4' },
  '0-30':   { label: '0–30 kun',   color: '#CA8A04', bg: '#FEFCE8' },
  '31-60':  { label: '31–60 kun',  color: '#D97706', bg: '#FFFBEB' },
  '61-90':  { label: '61–90 kun',  color: '#DC2626', bg: '#FEF2F2' },
  '90+':    { label: '90+ kun',    color: '#7F1D1D', bg: '#FEE2E2' },
};

export function getAgeBucket(dueDate?: string | null): AgeBucket {
  if (!dueDate) return 'joriy';
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86_400_000);
  if (days <= 0)  return 'joriy';
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

interface AgeBadgeProps {
  readonly dueDate?: string | null;
}

export function AgeBadge({ dueDate }: AgeBadgeProps) {
  const bucket = getAgeBucket(dueDate);
  const style  = AGE_STYLE[bucket];
  return (
    <View style={[ageBadgeStyles.wrap, { backgroundColor: style.bg }]}>
      <Text style={[ageBadgeStyles.text, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

const ageBadgeStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
