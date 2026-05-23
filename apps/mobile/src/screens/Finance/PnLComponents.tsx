import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './PnLScreen.styles';

// ─── KpiCard ────────────────────────────────────────────
interface KpiCardProps {
  readonly label: string;
  readonly value: string;
  readonly sub?: string;
  readonly color: string;
  readonly iconName: React.ComponentProps<typeof Ionicons>['name'];
  readonly iconBg: string;
}

export function KpiCard({ label, value, sub, color, iconName, iconBg }: KpiCardProps) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={color} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── TableRow ───────────────────────────────────────────
interface TableRowProps {
  readonly label: string;
  readonly value: string;
  readonly color?: string;
  readonly bold?: boolean;
  readonly indent?: boolean;
  readonly divider?: boolean;
}

export function TableRow({ label, value, color, bold, indent, divider }: TableRowProps) {
  return (
    <>
      {divider && <View style={styles.tableDivider} />}
      <View style={[styles.tableRow, indent && styles.tableRowIndent]}>
        <Text style={[styles.tableLabel, bold && styles.tableLabelBold, indent && styles.tableLabelIndent]}>
          {label}
        </Text>
        <Text style={[styles.tableValue, bold && styles.tableValueBold, color ? { color } : null]}>
          {value}
        </Text>
      </View>
    </>
  );
}

// ─── SegmentBar ─────────────────────────────────────────
interface SegmentBarProps {
  readonly segments: { value: number; color: string }[];
}

export function SegmentBar({ segments }: SegmentBarProps) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;
  return (
    <View style={styles.segBar}>
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (pct <= 0) return null;
        return (
          <View
            key={i}
            style={[
              styles.segSlice,
              { flex: pct, backgroundColor: seg.color },
              i === 0 && styles.segFirst,
              i === segments.length - 1 && styles.segLast,
            ]}
          />
        );
      })}
    </View>
  );
}
