import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '@/utils/format';
import type { Alert, AlertType } from '@/api/alerts.api';
import { styles } from './Alerts.styles';

// ─── Icon Config ─────────────────────────────────────────────────────────────

interface AlertIconConfig {
  readonly iconName: React.ComponentProps<typeof Ionicons>['name'];
  readonly bgColor: string;
  readonly iconColor: string;
}

const ALERT_ICON_MAP: Record<AlertType | 'default', AlertIconConfig> = {
  LOW_STOCK: {
    iconName: 'warning-outline',
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
  },
  LARGE_SALE: {
    iconName: 'cash-outline',
    bgColor: '#D1FAE5',
    iconColor: '#16A34A',
  },
  RENTAL_PAYMENT_DUE: {
    iconName: 'home-outline',
    bgColor: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  SUSPICIOUS_ACTIVITY: {
    iconName: 'shield-outline',
    bgColor: '#FEE2E2',
    iconColor: '#DC2626',
  },
  AI_INSIGHT: {
    iconName: 'bulb-outline',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
  },
  SHIFT_OPENED: {
    iconName: 'play-circle-outline',
    bgColor: '#D1FAE5',
    iconColor: '#16A34A',
  },
  SHIFT_CLOSED: {
    iconName: 'lock-closed-outline',
    bgColor: '#F3F4F6',
    iconColor: '#6B7280',
  },
  SYSTEM_ALERT: {
    iconName: 'settings-outline',
    bgColor: '#F3F4F6',
    iconColor: '#6B7280',
  },
  default: {
    iconName: 'notifications-outline',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
  },
};

function getIconConfig(type: AlertType): AlertIconConfig {
  return ALERT_ICON_MAP[type] ?? ALERT_ICON_MAP.default;
}

// ─── AlertRow Component ──────────────────────────────────────────────────────

interface AlertRowProps {
  readonly item: Alert;
  readonly onPress: () => void;
}

const AlertRow = React.memo(function AlertRow({ item, onPress }: AlertRowProps): React.JSX.Element {
  const { iconName, bgColor, iconColor } = getIconConfig(item.type);

  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
});

export default AlertRow;
