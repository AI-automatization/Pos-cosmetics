import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Radii } from '../../../config/theme';

interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (v: string) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly keyboardType?: 'default' | 'email-address' | 'phone-pad';
  readonly secureTextEntry?: boolean;
  readonly autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  required,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgApp,
  },
});
