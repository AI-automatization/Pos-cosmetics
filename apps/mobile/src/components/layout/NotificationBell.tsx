import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { colors } from '@/theme';
import type { Alert } from '@/api/alerts.api';
import NotificationDrawer from '@/components/layout/NotificationDrawer';
import type { NotificationDrawerRef } from '@/components/layout/NotificationDrawer';

interface Props {
  /** Bell icon tint. Defaults to the standard primary text color. */
  color?: string;
}

/**
 * Reusable notification bell: unread badge (driven by the real alerts query)
 * plus the shared NotificationDrawer it opens. Self-contained — no auth,
 * navigation or layout state required, so it can drop into any header.
 */
export default function NotificationBell({ color = colors.textPrimary }: Props): React.JSX.Element {
  const drawerRef = useRef<NotificationDrawerRef>(null);

  const { data: alerts } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: safeQueryFn<Alert[]>(() => alertsApi.getAll(), []),
    refetchInterval: 30_000,
  });

  const unreadCount = alerts?.filter((a) => !a.isRead).length ?? 0;

  return (
    <>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => drawerRef.current?.open()}
        accessibilityRole="button"
        accessibilityLabel="Bildirishnomalar"
      >
        <Ionicons name="notifications-outline" size={22} color={color} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : String(unreadCount)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <NotificationDrawer ref={drawerRef} />
    </>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
