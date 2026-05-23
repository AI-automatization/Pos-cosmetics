import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
}

export default function ManualBarcodeInput({ value, onChangeText, onSearch }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  const handleSearch = () => {
    inputRef.current?.blur();
    onSearch();
  };

  return (
    <View style={styles.row}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('scanner.manualInputPlaceholder')}
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.btn, value.trim().length === 0 && styles.btnDisabled]}
        onPress={handleSearch}
        disabled={value.trim().length === 0}
      >
        <Text style={styles.btnText}>{t('scanner.manualSearch')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  btn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  btnDisabled: {
    backgroundColor: '#93C5FD',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
