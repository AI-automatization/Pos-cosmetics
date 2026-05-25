import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';

interface PnLKpiCardProps {
  readonly label: string;
  readonly value: string;
  readonly subtitle: string;
  readonly color: string;
  readonly bgColor: string;
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function PnLKpiCard({ label, value, subtitle, color, bgColor, icon }: PnLKpiCardProps) {
  return (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <View style={[styles.kpiIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value} UZS</Text>
      <Text style={[styles.kpiSubtitle, { color }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kpiCard: {
    width: '47%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 14,
    gap: 4,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  kpiSubtitle: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
