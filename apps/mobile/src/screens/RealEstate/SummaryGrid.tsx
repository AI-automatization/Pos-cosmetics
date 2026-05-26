import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { RealEstateStats } from '@/api/realestate.api';

interface SummaryGridProps {
  stats: RealEstateStats;
}

interface CardConfig {
  label: string;
  value: number;
  valueColor: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
}

function buildCardConfigs(stats: RealEstateStats): [CardConfig, CardConfig, CardConfig, CardConfig] {
  return [
    {
      label: 'Jami mulklar',
      value: stats.totalProperties,
      valueColor: '#111827',
      iconName: 'business-outline',
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      label: 'Band',
      value: stats.rented,
      valueColor: '#16A34A',
      iconName: 'checkmark-circle-outline',
      iconColor: '#16A34A',
      iconBg: '#D1FAE5',
    },
    {
      label: "Bo'sh",
      value: stats.vacant,
      valueColor: '#6B7280',
      iconName: 'ellipse-outline',
      iconColor: '#6B7280',
      iconBg: '#F3F4F6',
    },
    {
      label: "Muddati o'tgan",
      value: stats.overduePayments,
      valueColor: '#DC2626',
      iconName: 'alert-circle-outline',
      iconColor: '#DC2626',
      iconBg: '#FEE2E2',
    },
  ];
}

function StatCard(props: CardConfig): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: props.iconBg }]}>
          <Ionicons name={props.iconName} size={16} color={props.iconColor} />
        </View>
        <Text style={[styles.value, { color: props.valueColor }]}>{props.value}</Text>
      </View>
      <Text style={styles.label}>{props.label}</Text>
    </View>
  );
}

export default function SummaryGrid({ stats }: SummaryGridProps): React.JSX.Element {
  const cards = buildCardConfigs(stats);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard {...cards[0]} />
        <StatCard {...cards[1]} />
      </View>
      <View style={styles.row}>
        <StatCard {...cards[2]} />
        <StatCard {...cards[3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
