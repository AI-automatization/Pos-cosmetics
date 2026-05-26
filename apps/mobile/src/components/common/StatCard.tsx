import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

interface TrendBadgeProps {
  readonly value: string;
  readonly positive?: boolean;
}

function TrendBadge({ value, positive = true }: TrendBadgeProps) {
  const badgeStyle = positive ? trendStyles.badgePositive : trendStyles.badgeNegative;
  const textStyle = positive ? trendStyles.textPositive : trendStyles.textNegative;
  const arrow = positive ? '\u25b2 ' : '\u25bc ';

  return (
    <View style={[trendStyles.badge, badgeStyle]}>
      <Text style={[trendStyles.text, textStyle]}>
        {arrow}{value}
      </Text>
    </View>
  );
}

const trendStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  badgePositive: {
    backgroundColor: colors.successLight,
  },
  badgeNegative: {
    backgroundColor: colors.dangerLight,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textPositive: {
    color: colors.success,
  },
  textNegative: {
    color: colors.danger,
  },
});

interface StatCardProps {
  /** Icon element rendered inside a colored circle (36x36) */
  readonly icon: React.ReactNode;
  /** Circle background color — defaults to primaryLight */
  readonly iconBg?: string;
  readonly title: string;
  readonly value: string;
  /** e.g. "+8%" — renders TrendBadge when provided */
  readonly trend?: string;
  readonly trendPositive?: boolean;
  /** Shown below value when trend is absent */
  readonly subtitle?: string;
  readonly style?: ViewStyle;
}

export default function StatCard({
  icon,
  iconBg = colors.primaryLight,
  title,
  value,
  trend,
  trendPositive = true,
  subtitle,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        {icon}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title.toUpperCase()}
      </Text>

      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>

      {trend !== undefined ? (
        <TrendBadge value={trend} positive={trendPositive} />
      ) : subtitle !== undefined ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecond,
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecond,
    marginTop: spacing[2],
  },
});
