import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './settings.constants';
import { styles } from './SettingsScreen.styles';

// ─── MenuRow ──────────────────────────────────────────

export interface MenuRowProps {
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly iconBg: string;
  readonly iconColor: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly value?: string;
  readonly onPress?: () => void;
  readonly right?: React.ReactNode;
  readonly danger?: boolean;
  readonly showChevron?: boolean;
}

export function MenuRow({
  icon,
  iconBg,
  iconColor,
  label,
  subtitle,
  value,
  onPress,
  right,
  danger = false,
  showChevron,
}: MenuRowProps) {
  const hasAction = Boolean(onPress);
  const chevronVisible = showChevron !== undefined ? showChevron : hasAction;

  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={hasAction ? 0.7 : 1}
      disabled={!hasAction}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.menuLabelContainer}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.menuRight}>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        {right ?? (chevronVisible ? (
          <Ionicons name="chevron-forward" size={16} color={C.muted} />
        ) : null)}
      </View>
    </TouchableOpacity>
  );
}

// ─── SectionTitle ─────────────────────────────────────

export function SectionTitle({ title }: { readonly title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ─── Card ─────────────────────────────────────────────

export function Card({ children }: { readonly children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

// ─── Divider ──────────────────────────────────────────

export function Divider() {
  return <View style={styles.divider} />;
}

// ─── SegmentControl ───────────────────────────────────

interface SegmentControlProps<T extends string> {
  readonly options: ReadonlyArray<{ value: T; label: string }>;
  readonly selected: T;
  readonly onSelect: (value: T) => void;
}

export function SegmentControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentControlProps<T>) {
  return (
    <View style={styles.segmentRow}>
      {options.map((opt, idx) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segmentBtn,
            selected === opt.value && styles.segmentBtnActive,
            idx === 0 && styles.segmentBtnFirst,
            idx === options.length - 1 && styles.segmentBtnLast,
          ]}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.segmentText,
              selected === opt.value && styles.segmentTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
