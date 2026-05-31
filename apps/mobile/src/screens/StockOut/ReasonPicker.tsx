// ReasonPicker.tsx — sabab tanlash grid

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockOutColors';
import { STATUS_CFG } from './StockOutTypes';
import type { WriteOffReason } from './StockOutTypes';

const REASONS: ReadonlyArray<WriteOffReason> = ['DAMAGED', 'EXPIRED', 'LOST', 'OTHER'];

interface ReasonPickerProps {
  readonly value:    WriteOffReason;
  readonly onChange: (reason: WriteOffReason) => void;
  readonly disabled: boolean;
}

function ReasonPicker({ value, onChange, disabled }: ReasonPickerProps) {
  return (
    <View style={pickerStyles.grid}>
      {REASONS.map((r) => {
        const cfg      = STATUS_CFG[r];
        const isActive = value === r;
        return (
          <TouchableOpacity
            key={r}
            style={[
              pickerStyles.btn,
              isActive && { backgroundColor: cfg.bg, borderColor: cfg.text },
            ]}
            onPress={() => onChange(r)}
            activeOpacity={0.75}
            disabled={disabled}
          >
            <Ionicons
              name={cfg.icon as 'warning-outline'}
              size={16}
              color={isActive ? cfg.text : C.muted}
            />
            <Text
              style={[
                pickerStyles.text,
                isActive && { color: cfg.text, fontWeight: '700' },
              ]}
            >
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default React.memo(ReasonPicker);

const pickerStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  btn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       C.border,
    backgroundColor:   C.white,
    minWidth:          '45%' as const,
  },
  text: {
    fontSize:   13,
    fontWeight: '500',
    color:      C.secondary,
  },
});
