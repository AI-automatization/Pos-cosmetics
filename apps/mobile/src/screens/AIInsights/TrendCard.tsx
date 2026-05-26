import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/components/common/Badge';
import type { InsightItem } from '@/api/analytics.api';
import { formatRelativeTime } from '@/utils/format';
import { colors, spacing, borderRadius } from '@/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_COLOR: Record<InsightItem['type'], string> = {
  TREND:     colors.success,
  DEADSTOCK: colors.danger,
  MARGIN:    colors.warning,
  FORECAST:  colors.purple,
};

const CATEGORY_BG: Record<InsightItem['type'], string> = {
  TREND:     '#D1FAE5',
  DEADSTOCK: '#FEE2E2',
  MARGIN:    '#FEF3C7',
  FORECAST:  '#EDE9FE',
};

const CATEGORY_TEXT: Record<InsightItem['type'], string> = {
  TREND:     '#065F46',
  DEADSTOCK: '#991B1B',
  MARGIN:    '#92400E',
  FORECAST:  '#5B21B6',
};

const CATEGORY_LABEL: Record<InsightItem['type'], string> = {
  TREND:     "O'sish",
  DEADSTOCK: "To'xtab qolgan",
  MARGIN:    'Margin',
  FORECAST:  'Prognoz',
};

const CATEGORY_ICON: Record<InsightItem['type'], keyof typeof Ionicons.glyphMap> = {
  TREND:     'trending-up-outline',
  DEADSTOCK: 'cube-outline',
  MARGIN:    'cash-outline',
  FORECAST:  'telescope-outline',
};

const PRIORITY_DOT_COLOR: Record<InsightItem['priority'], string> = {
  HIGH:   colors.danger,
  MEDIUM: colors.warning,
  LOW:    colors.primary,
};

// Static sparkline data — 5 points, purely visual
const SPARKLINE_POINTS: readonly number[] = [0.4, 0.6, 0.5, 0.8, 1.0];
const SPARKLINE_WIDTH  = 60;
const SPARKLINE_HEIGHT = 28;

// ---------------------------------------------------------------------------
// Sub-component: TypeBadge
// ---------------------------------------------------------------------------

interface TypeBadgeProps {
  readonly type: InsightItem['type'];
}

function TypeBadge({ type }: TypeBadgeProps): React.JSX.Element {
  return (
    <View style={[styles.typeBadge, { backgroundColor: CATEGORY_BG[type] }]}>
      <Text style={[styles.typeBadgeText, { color: CATEGORY_TEXT[type] }]}>
        {CATEGORY_LABEL[type]}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Sparkline (static, View-based)
// ---------------------------------------------------------------------------

interface SparklineProps {
  readonly categoryColor: string;
}

function Sparkline({ categoryColor }: SparklineProps): React.JSX.Element {
  const dotSize = 5;
  const barW    = Math.floor((SPARKLINE_WIDTH - dotSize) / (SPARKLINE_POINTS.length - 1));

  return (
    <View style={styles.sparklineContainer}>
      {SPARKLINE_POINTS.map((value, index) => {
        const bottom = value * (SPARKLINE_HEIGHT - dotSize);
        const left   = index * barW;

        return (
          <View
            key={index}
            style={[
              styles.sparklineDot,
              {
                backgroundColor: categoryColor,
                bottom,
                left,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main: TrendCard
// ---------------------------------------------------------------------------

interface TrendCardProps {
  readonly item: InsightItem;
}

export default function TrendCard({ item }: TrendCardProps): React.JSX.Element {
  const categoryColor  = CATEGORY_COLOR[item.type];
  const priorityColor  = PRIORITY_DOT_COLOR[item.priority];
  const iconName       = CATEGORY_ICON[item.type];

  return (
    <View style={styles.card}>
      {/* Priority indicator — left border strip */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <View style={styles.inner}>
        {/* Header row */}
        <View style={styles.headerRow}>
          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: categoryColor }]}>
            <Ionicons name={iconName} size={18} color={colors.surface} />
          </View>

          {/* Title + time */}
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.titleMeta}>
              <TypeBadge type={item.type} />
              <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Footer: priority badge + sparkline */}
        <View style={styles.footer}>
          <Badge
            label={item.priority}
            variant={
              item.priority === 'HIGH'
                ? 'danger'
                : item.priority === 'MEDIUM'
                ? 'warning'
                : 'info'
            }
          />
          <Sparkline categoryColor={categoryColor} />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    borderRadius.xl,
    borderWidth:     1,
    borderColor:     colors.border,
    flexDirection:   'row',
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  priorityBar: {
    width:        4,
    alignSelf:    'stretch',
  },
  inner: {
    flex:    1,
    padding: 14,
    gap:     spacing.sm,
  },
  headerRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            spacing.sm,
  },
  iconCircle: {
    width:          40,
    height:         40,
    borderRadius:   20,
    justifyContent: 'center',
    alignItems:     'center',
    flexShrink:     0,
  },
  headerContent: {
    flex: 1,
    gap:  4,
  },
  titleMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
    flexWrap:      'wrap',
  },
  title: {
    fontSize:   15,
    fontWeight: '700',
    color:      colors.textPrimary,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      borderRadius.full,
    alignSelf:         'flex-start',
  },
  typeBadgeText: {
    fontSize:   11,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color:    colors.textMuted,
  },
  description: {
    fontSize:   13,
    color:      colors.textSecond,
    lineHeight: 19,
  },
  footer: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    justifyContent: 'space-between',
    marginTop:      4,
  },
  sparklineContainer: {
    width:    SPARKLINE_WIDTH,
    height:   SPARKLINE_HEIGHT,
    position: 'relative',
  },
  sparklineDot: {
    position:     'absolute',
    width:        5,
    height:       5,
    borderRadius: 3,
    opacity:      0.45,
  },
});
