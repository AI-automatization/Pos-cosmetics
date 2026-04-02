// apps/mobile/src/screens/Kirim/components/ScannedItemMiniForm.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { C } from './types';
import type { LineItem } from './types';

interface ScannedItemMiniFormProps {
  readonly scanLine: Omit<LineItem, 'key'>;
  readonly onChangeField: (
    key: keyof Omit<LineItem, 'key'>,
  ) => (value: string) => void;
  readonly onAdd: () => void;
  readonly onCancel: () => void;
}

export default function ScannedItemMiniForm({
  scanLine,
  onChangeField,
  onAdd,
  onCancel,
}: ScannedItemMiniFormProps) {
  return (
    <View style={styles.miniForm}>
      <Text style={styles.miniFormTitle}>Barkod skanerlandi</Text>

      <Text style={styles.label}>Mahsulot nomi</Text>
      <TextInput
        style={styles.input}
        value={scanLine.productName}
        onChangeText={onChangeField('productName')}
        placeholder="Mahsulot nomi"
        placeholderTextColor={C.muted}
        returnKeyType="next"
      />

      <Text style={styles.label}>Miqdor *</Text>
      <TextInput
        style={styles.input}
        value={scanLine.quantity}
        onChangeText={onChangeField('quantity')}
        placeholder="0"
        placeholderTextColor={C.muted}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Text style={styles.label}>Kelish narxi (UZS) *</Text>
      <TextInput
        style={styles.input}
        value={scanLine.costPrice}
        onChangeText={onChangeField('costPrice')}
        placeholder="0"
        placeholderTextColor={C.muted}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Text style={styles.label}>Muddati (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={scanLine.expiryDate}
        onChangeText={onChangeField('expiryDate')}
        placeholder="2027-12-31"
        placeholderTextColor={C.muted}
        returnKeyType="done"
      />

      <View style={styles.miniFormActions}>
        <TouchableOpacity style={styles.miniCancelBtn} onPress={onCancel}>
          <Text style={styles.miniCancelBtnText}>Bekor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.miniAddBtn} onPress={onAdd}>
          <Text style={styles.miniAddBtnText}>Qo'shish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniForm: {
    marginTop: 12,
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
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
    color: '#111827',
    backgroundColor: C.bg,
  },
  miniFormActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  miniCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  miniAddBtn: {
    flex: 2,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  miniAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
