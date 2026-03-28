import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Linking, Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { nasiyaApi } from '../../api/nasiya.api';
import { extractErrorMessage } from '../../utils/error';

interface Props {
  visible: boolean;
  onClose: () => void;
  customer: { name: string; phone: string | null };
  debtId: string;
}

export default function ReminderActionSheet({ visible, onClose, customer, debtId }: Props) {
  const { t } = useTranslation();
  const [reminding, setReminding] = useState(false);

  const handlePhoneCall = () => {
    if (customer.phone) {
      onClose();
      void Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleTelegramReminder = async () => {
    setReminding(true);
    try {
      await nasiyaApi.sendReminder(debtId);
      onClose();
      Alert.alert('✅', t('nasiya.reminderSent'));
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    } finally {
      setReminding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{customer.name}</Text>
        <Text style={styles.subtitle}>Eslatma yuborish usulini tanlang</Text>

        {customer.phone != null && (
          <TouchableOpacity style={styles.btn} onPress={handlePhoneCall} activeOpacity={0.75}>
            <Text style={styles.btnIcon}>📞</Text>
            <View style={styles.btnInfo}>
              <Text style={styles.btnTitle}>Telefon qilish</Text>
              <Text style={styles.btnSub}>{customer.phone}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.btnTelegram]}
          onPress={handleTelegramReminder}
          activeOpacity={0.75}
          disabled={reminding}
        >
          {reminding ? (
            <ActivityIndicator size="small" color="#2563EB" style={styles.btnIconBox} />
          ) : (
            <Text style={styles.btnIcon}>✈️</Text>
          )}
          <View style={styles.btnInfo}>
            <Text style={styles.btnTitle}>Telegram eslatma</Text>
            <Text style={styles.btnSub}>Bot orqali avtomatik xabar</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.75}>
          <Text style={styles.cancelText}>Bekor qilish</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
    gap: 12,
  },
  btnTelegram: {
    backgroundColor: '#EFF6FF',
  },
  btnIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  btnIconBox: {
    width: 32,
  },
  btnInfo: { flex: 1 },
  btnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  btnSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});
