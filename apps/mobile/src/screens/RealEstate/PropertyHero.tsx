import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Property, PropertyStatus } from '@/api/realestate.api';
import { formatCurrency } from '@/utils/format';

interface PropertyHeroProps {
  readonly property: Property;
}

const STATUS_LABEL: Record<PropertyStatus, string> = {
  RENTED: 'Band',
  VACANT: "Bo'sh",
  MAINTENANCE: "Ta'mirlash",
};

const STATUS_BG: Record<PropertyStatus, string> = {
  RENTED: '#16A34A',
  VACANT: '#6B7280',
  MAINTENANCE: '#DC2626',
};

interface StatItem {
  value: string;
  label: string;
  color: string;
}

function buildStats(property: Property): StatItem[] {
  const items: StatItem[] = [];

  items.push({
    value: formatCurrency(property.rentAmount, property.currency),
    label: 'Ijara/oy',
    color: '#2563EB',
  });

  if (property.roi !== undefined) {
    items.push({
      value: `${property.roi.toFixed(1)}%`,
      label: 'ROI',
      color: '#16A34A',
    });
  }

  if (property.area !== undefined) {
    items.push({
      value: `${property.area} m²`,
      label: 'Maydon',
      color: '#111827',
    });
  }

  items.push({
    value: property.type,
    label: 'Tur',
    color: '#6B7280',
  });

  return items;
}

export default function PropertyHero({ property }: PropertyHeroProps): React.JSX.Element {
  const stats = buildStats(property);

  return (
    <View>
      {/* Photo area — 16:9 */}
      <View style={styles.photoArea}>
        <Ionicons name="home-outline" size={64} color="#9CA3AF" />

        {/* Gradient overlay (plain View) */}
        <View style={styles.gradientOverlay}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {property.name}
          </Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>
            {property.address}
          </Text>
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[property.status] }]}>
          <Text style={styles.statusText}>{STATUS_LABEL[property.status]}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: stat.color }]} numberOfLines={1}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoArea: {
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  propertyAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
});
