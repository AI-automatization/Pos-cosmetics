import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/api';
import type { Alert, AlertType } from '@/api/alerts.api';
import { safeQueryFn } from '@/utils/error';
import { formatRelativeTime } from '@/utils/format';
import { colors, spacing, typography } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const ALERTS_QUERY_KEY = ['alerts', 'all'] as const;

const DEFAULT_ICON: IconName = 'notifications-outline';
const DEFAULT_COLOR = colors.textSecond;

const TYPE_ICON: Record<AlertType, IconName> = {
  LOW_STOCK:           'alert-circle',
  LARGE_SALE:          'cash',
  RENTAL_PAYMENT_DUE:  'home',
  SUSPICIOUS_ACTIVITY: 'warning',
  AI_INSIGHT:          'bulb',
  SHIFT_OPENED:        'log-in',
  SHIFT_CLOSED:        'log-out',
  SYSTEM_ALERT:        'information-circle',
};

const TYPE_COLOR: Record<AlertType, string> = {
  LOW_STOCK:           colors.warning,
  LARGE_SALE:          colors.success,
  RENTAL_PAYMENT_DUE:  colors.primary,
  SUSPICIOUS_ACTIVITY: colors.danger,
  AI_INSIGHT:          colors.purple,
  SHIFT_OPENED:        colors.success,
  SHIFT_CLOSED:        colors.textSecond,
  SYSTEM_ALERT:        colors.textSecond,
};

const iconFor  = (type: AlertType): IconName => TYPE_ICON[type] ?? DEFAULT_ICON;
const colorFor = (type: AlertType): string   => TYPE_COLOR[type] ?? DEFAULT_COLOR;

export interface NotificationDrawerRef {
  open: () => void;
}

const NotificationDrawer = forwardRef<NotificationDrawerRef>((_, ref) => {
  const { t }      = useTranslation();
  const { height } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;

  // Same query key as NotificationBell → React Query dedupes (no double fetch).
  const { data: items = [] } = useQuery({
    queryKey: ALERTS_QUERY_KEY,
    queryFn: safeQueryFn<Alert[]>(() => alertsApi.getAll(), []),
  });

  const open = (): void => {
    setVisible(true);
    Animated.spring(translateY, {
      toValue:         0,
      useNativeDriver: true,
      tension:         65,
      friction:        11,
    }).start();
  };

  const close = (): void => {
    Animated.timing(translateY, {
      toValue:         height,
      duration:        250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  useImperativeHandle(ref, () => ({ open }));

  const invalidateAlerts = (): void => {
    void queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
  };

  const markOneRead = async (alert: Alert): Promise<void> => {
    if (alert.isRead) return;
    try {
      await alertsApi.markAsRead(alert.id);
    } finally {
      invalidateAlerts();
    }
  };

  const markAllRead = async (): Promise<void> => {
    const unread = items.filter((a) => !a.isRead);
    if (unread.length === 0) return;
    await Promise.allSettled(unread.map((a) => alertsApi.markAsRead(a.id)));
    invalidateAlerts();
  };

  const unreadCount = items.filter((a) => !a.isRead).length;

  const renderItem = ({ item }: { item: Alert }): React.JSX.Element => (
    <TouchableOpacity
      style={[styles.item, item.isRead && styles.itemRead]}
      activeOpacity={item.isRead ? 1 : 0.7}
      disabled={item.isRead}
      onPress={() => { void markOneRead(item); }}
      accessibilityRole="button"
    >
      <View style={[styles.iconWrap, { backgroundColor: colorFor(item.type) + '22' }]}>
        <Ionicons name={iconFor(item.type)} size={20} color={colorFor(item.type)} />
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDesc}  numberOfLines={2}>{item.message}</Text>
        <Text style={styles.itemTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={close} statusBarTranslucent>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header row */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {t('notifications.title', 'Bildirishnomalar')}
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}>  {unreadCount}</Text>
            )}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => { void markAllRead(); }} accessibilityRole="button">
              <Text style={styles.markAllText}>{t('notifications.markAllRead', "Barchasini o'qildi")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>{t('notifications.empty', "Bildirishnoma yo'q")}</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(n) => n.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </Modal>
  );
});

NotificationDrawer.displayName = 'NotificationDrawer';
export default NotificationDrawer;

const SHEET_HEIGHT = 480;

const styles = StyleSheet.create({
  backdrop: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          SHEET_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    paddingBottom:   spacing.xxl,
  },
  handle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: colors.border,
    alignSelf:       'center',
    marginTop:       spacing.sm,
    marginBottom:    spacing.sm,
  },
  sheetHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  unreadCount: {
    color:    colors.primary,
    fontSize: 16,
  },
  markAllText: {
    ...typography.label,
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.sm,
  },
  separator: {
    height:          1,
    backgroundColor: colors.border,
    marginVertical:  spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    paddingVertical: spacing.sm,
    gap:           spacing.md,
  },
  itemRead: {
    opacity: 0.55,
  },
  iconWrap: {
    width:          40,
    height:         40,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    color:      colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDesc: {
    ...typography.caption,
    color:       colors.textSecond,
    marginBottom: 4,
  },
  itemTime: {
    ...typography.caption,
    color: colors.textDisabled,
  },
  unreadDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: colors.primary,
    marginTop:       6,
  },
  empty: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecond,
  },
});
