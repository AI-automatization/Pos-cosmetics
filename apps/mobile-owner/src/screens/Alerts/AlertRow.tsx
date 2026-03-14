import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../api/alerts.api';
import { formatRelative } from '../../utils/formatDate';
import { NotificationType } from '../../notifications/types';
import { Colors, Radii, Shadows } from '../../config/theme';

interface AlertRowProps {
  item: Alert;
  onPress: (alert: Alert) => void;
}

const TYPE_CONFIG: Record<NotificationType, { iconName: React.ComponentProps<typeof Ionicons>['name']; iconColor: string; leftBorder: string }> = {
  LOW_STOCK:           { iconName: 'alert-circle-outline',      iconColor: Colors.warning,  leftBorder: Colors.warning },
  OUT_OF_STOCK:        { iconName: 'close-circle-outline',      iconColor: Colors.danger,   leftBorder: Colors.danger },
  EXPIRY_WARNING:      { iconName: 'time-outline',              iconColor: Colors.orange,   leftBorder: Colors.orange },
  LARGE_REFUND:        { iconName: 'return-down-back-outline',  iconColor: Colors.purple,   leftBorder: Colors.purple },
  SUSPICIOUS_ACTIVITY: { iconName: 'warning-outline',           iconColor: Colors.danger,   leftBorder: Colors.danger },
  SHIFT_CLOSED:        { iconName: 'lock-closed-outline',       iconColor: Colors.textMuted, leftBorder: Colors.textMuted },
  SYSTEM_ERROR:        { iconName: 'bug-outline',               iconColor: Colors.danger,   leftBorder: Colors.danger },
  NASIYA_OVERDUE:      { iconName: 'card-outline',              iconColor: Colors.orange,   leftBorder: Colors.orange },
};

export default function AlertRow({ item, onPress }: AlertRowProps) {
  const { t } = useTranslation();
  const config = TYPE_CONFIG[item.type] ?? { iconName: 'notifications-outline' as const, iconColor: Colors.textMuted, leftBorder: Colors.textMuted };

  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.unread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.leftBorder, { backgroundColor: config.leftBorder }]} />
      <View style={styles.iconContainer}>
        <Ionicons name={config.iconName} size={22} color={config.iconColor} />
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.type}>{t(`alerts.${item.type}`)}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.meta}>{item.branchName} · {formatRelative(item.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    gap: 12,
    paddingRight: 12,
    ...Shadows.card,
  },
  unread: { backgroundColor: Colors.unreadBg },
  leftBorder: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    paddingVertical: 14,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.unreadDot,
  },
  content: { flex: 1, gap: 2, paddingVertical: 12 },
  type: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  desc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  meta: { fontSize: 12, color: Colors.textMuted },
});
