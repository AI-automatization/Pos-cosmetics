import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <Text style={styles.sectionLabel}>TO'LOV USULI</Text>
      <View style={styles.methodGrid}>
        {METHODS.map((m) => {
          const active = method === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodBtn,
                active
                  ? { backgroundColor: m.color, borderColor: m.color }
                  : { borderColor: m.color + '40' },
              ]}
              onPress={() => onSelect(m.key)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name={m.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                size={20}
                color={active ? '#FFFFFF' : m.color}
              />
              <Text
                style={[
                  styles.methodLabel,
                  { color: active ? '#FFFFFF' : m.color },
                ]}
              >
                {m.label}
              </Text>
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
    marginBottom: 10,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  methodBtn: {
    width: '31%',
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    gap: 4,
    minHeight: 48,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
