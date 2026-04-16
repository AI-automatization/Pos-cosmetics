import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { METHODS, type PaymentMethod } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly method: PaymentMethod;
  readonly onSelect: (m: PaymentMethod) => void;
}

// ─── Component ─────────────────────────────────────────
export default function PaymentMethodPicker({ method, onSelect }: Props) {
  return (
    <>
      <Text style={styles.sectionLabel}>TO'LOV USULINI TANLANG</Text>
      <View style={styles.methodRow}>
        {METHODS.map((m) => {
          const active = method === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodCard,
                active && { borderColor: m.color, backgroundColor: m.color + '12' },
              ]}
              onPress={() => onSelect(m.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.methodIcon, { backgroundColor: m.color + '20' }]}>
                <MaterialCommunityIcons
                  name={m.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={22}
                  color={m.color}
                />
              </View>
              <Text style={[styles.methodLabel, active && { color: m.color }]}>
                {m.label}
              </Text>
              {active && (
                <View style={[styles.methodCheck, { backgroundColor: m.color }]}>
                  <Ionicons name="checkmark" size={10} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
    position: 'relative',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  methodCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
