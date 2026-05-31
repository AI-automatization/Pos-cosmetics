import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../../navigation/types';
import { alertsApi } from '../../api/alerts.api';
import type { Alert } from '../../api/alerts.api';
import NotificationRow from './NotificationRow';
import EmptyNotifications from './EmptyNotifications';
import styles, { PRIMARY } from './Notifications.styles';

// ─── NotificationsScreen ─────────────────────────────────────────────────────

export default function NotificationsScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();
  const { t } = useTranslation();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadAlerts = useCallback(async (): Promise<void> => {
    setHasError(false);
    setIsLoading(true);
    try {
      const data = await alertsApi.getAll();
      setAlerts(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAlerts();
    }, [loadAlerts]),
  );

  const handlePress = useCallback(async (item: Alert): Promise<void> => {
    if (item.isRead) return;
    try {
      await alertsApi.markAsRead(item.id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isRead: true } : a)),
      );
    } catch {
      // Silent fail — item hali ko'rsatiladi
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('notifications.back')}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : hasError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{t('notifications.loadError')}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => void loadAlerts()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>{t('notifications.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={handlePress} t={t} />
          )}
          ListEmptyComponent={<EmptyNotifications t={t} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
