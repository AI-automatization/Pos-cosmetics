import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import { useAuthStore } from '@/store/auth.store';

export default function ProfileScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <ScreenLayout>
      <Card>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.charAt(0).toUpperCase() ?? '?'}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.field}>
          <Text style={styles.label}>{t('settings.profile')}</Text>
          <Text style={styles.value}>{user?.firstName}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role}</Text>
        </View>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a56db',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  field: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
