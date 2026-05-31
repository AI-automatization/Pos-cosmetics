import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { styles, C } from './NewDebtSheet.styles';
import type { NewDebtFieldErrors } from '../../validation/nasiya.schema';

interface FormState {
  customerName: string;
  phone: string;
  totalAmount: string;
  dueDate: string;
  notes: string;
}

interface DebtFormFieldsProps {
  readonly form: FormState;
  readonly onChangeField: (key: keyof FormState) => (value: string) => void;
  readonly disabled: boolean;
  readonly errors?: NewDebtFieldErrors;
}

function DebtFormFields({ form, onChangeField, disabled, errors }: DebtFormFieldsProps) {
  return (
    <View>
      {/* Mijoz ismi */}
      <Text style={styles.label}>Mijoz ismi *</Text>
      <TextInput
        style={[styles.input, errors?.customerName && fieldStyles.inputError]}
        value={form.customerName}
        onChangeText={onChangeField('customerName')}
        placeholder="Ismi familiyasi"
        placeholderTextColor={C.muted}
        editable={!disabled}
        returnKeyType="next"
      />
      {errors?.customerName && (
        <Text style={fieldStyles.errorText}>{errors.customerName}</Text>
      )}

      {/* Telefon */}
      <Text style={styles.label}>Telefon raqami</Text>
      <TextInput
        style={[styles.input, errors?.phone && fieldStyles.inputError]}
        value={form.phone}
        onChangeText={onChangeField('phone')}
        placeholder="+998 90 000 00 00"
        placeholderTextColor={C.muted}
        keyboardType="phone-pad"
        editable={!disabled}
        returnKeyType="next"
      />
      {errors?.phone && (
        <Text style={fieldStyles.errorText}>{errors.phone}</Text>
      )}

      {/* Summa */}
      <Text style={styles.label}>Summa (UZS) *</Text>
      <TextInput
        style={[styles.input, errors?.totalAmount && fieldStyles.inputError]}
        value={form.totalAmount}
        onChangeText={onChangeField('totalAmount')}
        placeholder="0"
        placeholderTextColor={C.muted}
        keyboardType="numeric"
        editable={!disabled}
        returnKeyType="next"
      />
      {errors?.totalAmount && (
        <Text style={fieldStyles.errorText}>{errors.totalAmount}</Text>
      )}

      {/* Muddat sanasi */}
      <Text style={styles.label}>Muddat sanasi</Text>
      <TextInput
        style={[styles.input, errors?.dueDate && fieldStyles.inputError]}
        value={form.dueDate}
        onChangeText={onChangeField('dueDate')}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={C.muted}
        editable={!disabled}
        returnKeyType="next"
      />
      {errors?.dueDate && (
        <Text style={fieldStyles.errorText}>{errors.dueDate}</Text>
      )}

      {/* Izoh */}
      <Text style={styles.label}>Izoh</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline, errors?.notes && fieldStyles.inputError]}
        value={form.notes}
        onChangeText={onChangeField('notes')}
        placeholder="Qo'shimcha ma'lumot..."
        placeholderTextColor={C.muted}
        multiline
        numberOfLines={3}
        editable={!disabled}
        returnKeyType="done"
      />
      {errors?.notes && (
        <Text style={fieldStyles.errorText}>{errors.notes}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  inputError: {
    borderColor: C.red,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: C.red,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default React.memo(DebtFormFields);
