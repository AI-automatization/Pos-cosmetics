import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

const UZBEK_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

const UZBEK_DAYS = [
  'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba',
  'Payshanba', 'Juma', 'Shanba',
];

function formatUzbekDate(): string {
  const now = new Date();
  return `${now.getDate()} ${UZBEK_MONTHS[now.getMonth()]}, ${now.getFullYear()}, ${UZBEK_DAYS[now.getDay()]}`;
}

interface DashboardHeaderProps {
  readonly unreadCount: number;
  readonly onBellPress: () => void;
}

function DashboardHeader({ unreadCount, onBellPress }: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Bosh sahifa</Text>
        <Text style={styles.headerDate}>{formatUzbekDate()}</Text>
      </View>
      <TouchableOpacity
        style={styles.bellBtn}
        activeOpacity={0.7}
        onPress={onBellPress}
      >
        <Ionicons name="notifications-outline" size={24} color="#374151" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : String(unreadCount)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(DashboardHeader);
