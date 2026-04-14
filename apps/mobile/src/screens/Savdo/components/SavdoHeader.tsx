import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './utils';

interface SavdoHeaderProps {
  readonly alertCount: number;
  readonly isShiftOpen: boolean;
  readonly shiftId?: string | null;
  readonly onBellPress: () => void;
}

export default function SavdoHeader({
  alertCount,
  isShiftOpen,
  shiftId,
  onBellPress,
}: SavdoHeaderProps) {
  const shiftLabel =
    isShiftOpen && shiftId
      ? `S-${shiftId.slice(-6).toUpperCase()}`
      : 'Smena yopiq';

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Savdo</Text>

      {/* Smena chip */}
      <View style={[styles.smenaChip, isShiftOpen ? styles.smenaOpen : styles.smenaClosed]}>
        <View
          style={[
            styles.smenaDot,
            { backgroundColor: isShiftOpen ? '#16A34A' : '#D97706' },
          ]}
        />
        <Text
          style={[
            styles.smenaLabel,
            { color: isShiftOpen ? '#16A34A' : '#D97706' },
          ]}
        >
          {shiftLabel}
        </Text>
      </View>

      {/* Bell icon */}
      <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7} onPress={onBellPress}>
        <Ionicons name="notifications-outline" size={22} color={C.text} />
        {alertCount > 0 && (
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>{alertCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    flex: 1,
  },
  smenaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  smenaOpen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  smenaClosed: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  smenaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  smenaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
