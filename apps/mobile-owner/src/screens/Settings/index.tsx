import React from 'react';
import { ScrollView, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../components/layout/ScreenLayout';
import ProfileScreen from './ProfileScreen';
import LanguageScreen from './LanguageScreen';
import NotificationPrefsScreen from './NotificationPrefsScreen';
import { useAuthStore } from '../../store/auth.store';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => { void logout(); },
        },
      ],
    );
  }

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenLayout title={t('settings.title')} showBranchSelector={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileScreen />
        <LanguageScreen />
        <NotificationPrefsScreen />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('settings.version')} {version}</Text>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  logoutButton: {
    margin: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
});
