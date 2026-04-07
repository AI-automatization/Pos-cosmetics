import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '../../../config/theme';

interface ToggleRowProps {
  readonly label: string;
  readonly sublabel?: string;
  readonly value: boolean;
  readonly onChange: (v: boolean) => void;
}

export default function ToggleRow({ label, sublabel, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabels}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel && <Text style={styles.toggleSublabel}>{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primaryMid }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabels: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  toggleSublabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
