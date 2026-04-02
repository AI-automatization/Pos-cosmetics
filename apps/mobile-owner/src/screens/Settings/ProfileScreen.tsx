import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.name')}</Text>
        <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.email')}</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.role')}</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { fontSize: 15, color: '#374151' },
  value: { fontSize: 15, color: '#6B7280' },
});
