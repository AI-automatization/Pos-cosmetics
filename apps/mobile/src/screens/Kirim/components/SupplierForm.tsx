import { View, Text, TextInput, StyleSheet } from 'react-native';
import { C } from './types';
import type { FormState } from './types';

interface SupplierFormProps {
  form: FormState;
  setField: (key: keyof FormState) => (value: string) => void;
  loading: boolean;
}

export default function SupplierForm({ form, setField, loading }: SupplierFormProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Yetkazib beruvchi</Text>

      <Text style={styles.label}>Tashkilot nomi *</Text>
      <TextInput
        style={styles.input}
        value={form.supplierName}
        onChangeText={setField('supplierName')}
        placeholder="Masalan: Loreal Distribution"
        placeholderTextColor={C.muted}
        editable={!loading}
        returnKeyType="next"
      />

      <Text style={styles.label}>Hujjat raqami</Text>
      <TextInput
        style={styles.input}
        value={form.invoiceNumber}
        onChangeText={setField('invoiceNumber')}
        placeholder="INV-2026-001"
        placeholderTextColor={C.muted}
        editable={!loading}
        returnKeyType="next"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
});
