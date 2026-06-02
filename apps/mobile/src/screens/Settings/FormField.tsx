import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { fStyles } from './UserFormSheet.styles';

interface FormFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder: string;
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly secureTextEntry?: boolean;
  readonly error?: string;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  error,
}: FormFieldProps) {
  return (
    <View style={fStyles.fieldWrap}>
      <Text style={fStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[fStyles.fieldInput, error ? fStyles.fieldInputError : undefined]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={fStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default React.memo(FormField);
