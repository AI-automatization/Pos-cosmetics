import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  productName: string | undefined;
  qty: string;
  onChangeQty: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CountQtyModal({
  visible,
  productName,
  qty,
  onChangeQty,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('scanner.actualQty')}</Text>
          <Text style={styles.product} numberOfLines={1}>
            {productName}
          </Text>
          <TextInput
            style={styles.input}
            value={qty}
            onChangeText={onChangeQty}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('nasiya.payCancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>{t('nasiya.payConfirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  product: { fontSize: 14, color: '#6B7280' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
  },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2563EB',
  },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
