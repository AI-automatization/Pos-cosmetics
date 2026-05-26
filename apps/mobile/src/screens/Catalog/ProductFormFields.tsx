import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles, C } from './ProductFormScreen.styles';

// ─── Sub-components ────────────────────────────────────

export function SectionTitle({ children }: { readonly children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

interface FormFieldProps {
  readonly label: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
}

export function FormField({ label, required, children }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

interface InputProps {
  readonly value: string;
  readonly onChangeText?: (v: string) => void;
  readonly placeholder?: string;
  readonly keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  readonly editable?: boolean;
  readonly multiline?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  multiline = false,
}: InputProps) {
  return (
    <TextInput
      style={[
        styles.input,
        !editable && styles.inputReadOnly,
        multiline && styles.inputMultiline,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.muted}
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}
