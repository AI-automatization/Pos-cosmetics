import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import styles from './Notifications.styles';

interface EmptyNotificationsProps {
  readonly t: TFunction;
}

export default function EmptyNotifications({ t }: EmptyNotificationsProps): React.JSX.Element {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
      <Text style={styles.emptySubtitle}>{t('notifications.emptySubtitle')}</Text>
    </View>
  );
}
