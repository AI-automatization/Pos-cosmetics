import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import type { InsightItem } from '@/api/analytics.api';
import { formatRelativeTime } from '@/utils/format';

const INSIGHT_EMOJI: Record<string, string> = {
  TREND: '📈',
  DEADSTOCK: '📦',
  MARGIN: '💰',
  FORECAST: '🔮',
};

const PRIORITY_VARIANT: Record<string, 'danger' | 'warning' | 'info'> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'info',
};

interface TrendCardProps {
  readonly item: InsightItem;
}

export default function TrendCard({ item }: TrendCardProps): React.JSX.Element {
  const emoji = INSIGHT_EMOJI[item.type] ?? '💡';
  const priorityVariant = PRIORITY_VARIANT[item.priority] ?? 'info';

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        <Badge label={item.priority} variant={priorityVariant} />
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  emoji: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
});
