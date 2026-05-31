import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import type { Alert, AlertType } from '../../api/alerts.api';
import styles from './Notifications.styles';

// ─── Icon Config ─────────────────────────────────────────────────────────────

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconConfig {
  readonly iconName: IconName;
  readonly bgColor: string;
  readonly iconColor: string;
}

const ICON_MAP: Record<AlertType | 'default', IconConfig> = {
  LOW_STOCK:           { iconName: 'warning-outline',      bgColor: '#FEF3C7', iconColor: '#D97706' },
  LARGE_SALE:          { iconName: 'cash-outline',          bgColor: '#D1FAE5', iconColor: '#16A34A' },
  RENTAL_PAYMENT_DUE:  { iconName: 'home-outline',          bgColor: '#EDE9FE', iconColor: '#7C3AED' },
  SUSPICIOUS_ACTIVITY: { iconName: 'shield-outline',        bgColor: '#FEE2E2', iconColor: '#DC2626' },
  AI_INSIGHT:          { iconName: 'bulb-outline',          bgColor: '#EFF6FF', iconColor: '#2563EB' },
  SHIFT_OPENED:        { iconName: 'play-circle-outline',   bgColor: '#D1FAE5', iconColor: '#16A34A' },
  SHIFT_CLOSED:        { iconName: 'lock-closed-outline',   bgColor: '#F3F4F6', iconColor: '#6B7280' },
  SYSTEM_ALERT:        { iconName: 'settings-outline',      bgColor: '#F3F4F6', iconColor: '#6B7280' },
  default:             { iconName: 'notifications-outline', bgColor: '#EFF6FF', iconColor: '#2563EB' },
};

function getIconConfig(type: AlertType): IconConfig {
  return ICON_MAP[type] ?? ICON_MAP.default;
}

// ─── Time Formatter ──────────────────────────────────────────────────────────

export function formatTime(iso: string, t: TFunction): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return t('notifications.timeNow');
  if (diffMin < 60) return t('notifications.timeMinutes', { count: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t('notifications.timeHours', { count: diffH });
  const diffD = Math.floor(diffH / 24);
  return t('notifications.timeDays', { count: diffD });
}

// ─── NotificationRow ─────────────────────────────────────────────────────────

interface NotificationRowProps {
  readonly item: Alert;
  readonly onPress: (item: Alert) => void;
  readonly t: TFunction;
}

const NotificationRow = React.memo(function NotificationRow({
  item,
  onPress,
  t,
}: NotificationRowProps): React.JSX.Element {
  const { iconName, bgColor, iconColor } = getIconConfig(item.type);
  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.iconWrapper}>
        <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.rowTime}>{formatTime(item.createdAt, t)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
});

export default NotificationRow;
