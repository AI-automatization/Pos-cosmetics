import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, C } from './FinanceScreen.styles';

// ─── StatCard ──────────────────────────────────────────
interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly subValue?: string;
  readonly iconName: React.ComponentProps<typeof Ionicons>['name'];
  readonly iconColor: string;
  readonly iconBg: string;
}

export function StatCard({
  label,
  value,
  subValue,
  iconName,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subValue ? <Text style={styles.statSub}>{subValue}</Text> : null}
    </View>
  );
}

// ─── NavCard ───────────────────────────────────────────
interface NavCardProps {
  readonly label: string;
  readonly iconName: React.ComponentProps<typeof Ionicons>['name'];
  readonly iconColor: string;
  readonly iconBg: string;
  readonly onPress: () => void;
}

export function NavCard({
  label,
  iconName,
  iconColor,
  iconBg,
  onPress,
}: NavCardProps) {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.navIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={C.muted} style={styles.navChevron} />
    </TouchableOpacity>
  );
}
