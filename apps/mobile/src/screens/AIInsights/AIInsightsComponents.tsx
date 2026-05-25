import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { styles } from './AIInsightsScreen.styles';

// ─── Types ────────────────────────────────────────────────
export type FilterType = 'ALL' | 'TREND' | 'DEADSTOCK' | 'MARGIN' | 'FORECAST';
export type PeriodType = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER';

// ─── Constants ────────────────────────────────────────────
export const FILTERS: FilterType[] = ['ALL', 'TREND', 'DEADSTOCK', 'MARGIN', 'FORECAST'];
export const PERIODS: PeriodType[] = ['TODAY', 'WEEK', 'MONTH', 'QUARTER'];

const FILTER_ICON: Record<FilterType, keyof typeof Ionicons.glyphMap> = {
  ALL:       'grid-outline',
  TREND:     'trending-up-outline',
  DEADSTOCK: 'cube-outline',
  MARGIN:    'cash-outline',
  FORECAST:  'telescope-outline',
};

const FILTER_ACTIVE_COLOR: Record<FilterType, string> = {
  ALL:       colors.primary,
  TREND:     colors.success,
  DEADSTOCK: colors.danger,
  MARGIN:    colors.warning,
  FORECAST:  colors.purple,
};

const PERIOD_LABEL: Record<PeriodType, string> = {
  TODAY:   'insights.periodToday',
  WEEK:    'insights.periodWeek',
  MONTH:   'insights.periodMonth',
  QUARTER: 'insights.periodQuarter',
};

// ─── ScreenHeader ─────────────────────────────────────────
interface ScreenHeaderProps {
  readonly title: string;
  readonly subtitle: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps): React.JSX.Element {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderTitle}>
        <Text style={styles.screenHeaderText}>{title}</Text>
        <Ionicons name="sparkles" size={20} color="#F59E0B" />
      </View>
      <Text style={styles.screenHeaderSubtitle}>{subtitle}</Text>
    </View>
  );
}

// ─── PeriodSelector ───────────────────────────────────────
interface PeriodSelectorProps {
  readonly period: PeriodType;
  readonly onSelect: (p: PeriodType) => void;
}

export function PeriodSelector({ period, onSelect }: PeriodSelectorProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.periodRow}
    >
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p}
          style={[styles.periodPill, period === p && styles.periodPillActive]}
          onPress={() => onSelect(p)}
          accessibilityRole="button"
        >
          <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
            {t(PERIOD_LABEL[p])}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── FilterChips ──────────────────────────────────────────
interface FilterChipsProps {
  readonly filter: FilterType;
  readonly onSelect: (f: FilterType) => void;
}

export function FilterChips({ filter, onSelect }: FilterChipsProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {FILTERS.map((f) => {
        const isActive    = filter === f;
        const activeColor = FILTER_ACTIVE_COLOR[f];
        return (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              isActive && { backgroundColor: activeColor },
            ]}
            onPress={() => onSelect(f)}
            accessibilityRole="button"
          >
            <Ionicons
              name={FILTER_ICON[f]}
              size={13}
              color={isActive ? colors.surface : colors.textSecond}
              style={styles.filterIcon}
            />
            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
              {t(`insights.filter${f}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── SummaryRow ───────────────────────────────────────────
interface SummaryRowProps {
  readonly totalCount: number;
  readonly criticalCount: number;
}

export function SummaryRow({ totalCount, criticalCount }: SummaryRowProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryPill}>
        <Text style={styles.summaryText}>
          {t('insights.summaryTotal', { count: totalCount })}
        </Text>
      </View>
      {criticalCount > 0 && (
        <View style={[styles.summaryPill, styles.summaryPillCritical]}>
          <Ionicons name="warning-outline" size={12} color={colors.danger} />
          <Text style={[styles.summaryText, styles.summaryTextCritical]}>
            {t('insights.summaryCritical', { count: criticalCount })}
          </Text>
        </View>
      )}
    </View>
  );
}
