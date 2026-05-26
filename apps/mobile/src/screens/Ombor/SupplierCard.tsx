// Ombor — SupplierCard: individual supplier list item
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import type { Supplier } from '../../api/catalog.api';
import { C } from './OmborColors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SupplierCardProps {
  readonly item: Supplier;
  readonly onPress: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SupplierCard = React.memo(function SupplierCard({
  item,
  onPress,
}: SupplierCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardBody}>
        {/* Left: initials circle */}
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{getInitials(item.name)}</Text>
        </View>

        {/* Center: info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.company ? (
            <Text style={styles.cardCompany} numberOfLines={1}>
              {item.company}
            </Text>
          ) : null}
          {item.phone ? (
            <Text style={styles.cardPhone} numberOfLines={1}>
              {item.phone}
            </Text>
          ) : null}
          {item.address ? (
            <Text style={styles.cardAddress} numberOfLines={1}>
              {item.address}
            </Text>
          ) : null}
        </View>

        {/* Right: active/inactive badge */}
        <View
          style={[
            styles.activeBadge,
            { backgroundColor: item.isActive ? '#DCFCE7' : '#FEE2E2' },
          ]}
        >
          <Text
            style={[
              styles.activeBadgeText,
              { color: item.isActive ? C.green : C.red },
            ]}
          >
            {item.isActive ? 'Faol' : 'Nofaol'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default SupplierCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialsCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  cardCompany: {
    fontSize: 13,
    color: C.muted,
  },
  cardPhone: {
    fontSize: 13,
    color: C.muted,
  },
  cardAddress: {
    fontSize: 12,
    color: C.muted,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
