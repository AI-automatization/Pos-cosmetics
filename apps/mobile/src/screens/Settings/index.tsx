import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import { useAuthStore } from '@/store/auth.store';
import Constants from 'expo-constants';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;
};

interface MenuItemProps {
  label: string;
  icon: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ label, icon, onPress, danger }: MenuItemProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} accessibilityRole="button">
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const handleLogout = (): void => {
    Alert.alert(t('auth.logout'), t('settings.logout') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.logout'), style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <ScreenLayout title={t('settings.title')}>
      {/* User info */}
      <Card>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>{user?.role}</Text>
      </Card>

      {/* Menu */}
      <Card style={styles.menuCard}>
        <MenuItem
          label={t('settings.profile')}
          icon="👤"
          onPress={() => navigation.navigate('Profile')}
        />
        <View style={styles.divider} />
        <MenuItem
          label={t('settings.notifications')}
          icon="🔔"
          onPress={() => navigation.navigate('NotificationPrefs')}
        />
      </Card>

      <Card style={styles.menuCard}>
        <MenuItem
          label={t('auth.logout')}
          icon="🚪"
          onPress={handleLogout}
          danger
        />
      </Card>

      <Text style={styles.version}>
        {t('settings.version')}: {Constants.expoConfig?.version ?? '0.1.0'}
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  menuLabelDanger: {
    color: '#dc2626',
  },
  chevron: {
    fontSize: 20,
    color: '#d1d5db',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 64,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#1a56db',
    fontWeight: '600',
    marginTop: 4,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});
