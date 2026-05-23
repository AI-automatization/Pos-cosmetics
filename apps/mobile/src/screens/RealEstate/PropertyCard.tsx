import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Property, PropertyStatus } from '@/api/realestate.api';
import { formatCurrency } from '@/utils/format';

interface PropertyCardProps {
  readonly item: Property;
  readonly onPress: () => void;
}

interface StatusConfig {
  readonly bg: string;
  readonly label: string;
}

const STATUS_CONFIG: Record<PropertyStatus, StatusConfig> = {
  RENTED: { bg: '#16A34A', label: 'Band' },
  VACANT: { bg: '#6B7280', label: "Bo'sh" },
  MAINTENANCE: { bg: '#DC2626', label: "Ta'mirlash" },
};

export default function PropertyCard({ item, onPress }: PropertyCardProps): React.JSX.Element {
  const status = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.wrapper}
      accessibilityRole="button"
    >
      {/* Photo area — 16:9 */}
      <View style={styles.photoArea}>
        <Ionicons name="home-outline" size={48} color="#9CA3AF" />

        {/* Dark gradient overlay at bottom */}
        <View style={styles.overlay}>
          <Text style={styles.overlayName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.overlayAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      </View>

      {/* Info row */}
      <View style={styles.infoRow}>
        <View style={styles.tenantRow}>
          <Ionicons name="person-outline" size={14} color="#9CA3AF" />
          {item.tenantName ? (
            <Text style={styles.tenantName} numberOfLines={1}>
              {item.tenantName}
            </Text>
          ) : (
            <Text style={styles.tenantEmpty}>"Bo'sh"</Text>
          )}
        </View>

        <Text style={styles.rentAmount}>
          {formatCurrency(item.rentAmount, item.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  photoArea: {
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  overlayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overlayAddress: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  tenantName: {
    fontSize: 13,
    color: '#374151',
    flexShrink: 1,
  },
  tenantEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  rentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
});
