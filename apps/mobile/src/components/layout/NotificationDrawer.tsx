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
import { colors, spacing, typography } from '@/theme';

interface Notification {
  id:        string;
  type:      'LOW_STOCK' | 'LARGE_SALE' | 'RENTAL_PAYMENT_DUE' | 'SUSPICIOUS_ACTIVITY' | 'AI_INSIGHT' | 'SYSTEM_ALERT';
  title:     string;
  body:      string;
  time:      string;
  isRead:    boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'LOW_STOCK',    title: 'Kam qolgan tovar',        body: 'Shampun 500ml — 3 dona qoldi',          time: '5 daq oldin',  isRead: false },
  { id: '2', type: 'LARGE_SALE',   title: 'Katta sotuv',             body: '1,250,000 UZS — Chilonzor filiali',     time: '1 soat oldin', isRead: false },
  { id: '3', type: 'AI_INSIGHT',   title: "AI tavsiya",              body: 'Dushanba kunlari sotuv 23% yuqori',     time: '2 soat oldin', isRead: true  },
];

const TYPE_ICON: Record<Notification['type'], keyof typeof Ionicons.glyphMap> = {
  LOW_STOCK:          'alert-circle',
  LARGE_SALE:         'cash',
  RENTAL_PAYMENT_DUE: 'home',
  SUSPICIOUS_ACTIVITY:'warning',
  AI_INSIGHT:         'bulb',
  SYSTEM_ALERT:       'information-circle',
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  LOW_STOCK:          colors.warning,
  LARGE_SALE:         colors.success,
  RENTAL_PAYMENT_DUE: colors.primary,
  SUSPICIOUS_ACTIVITY:colors.danger,
  AI_INSIGHT:         colors.purple,
  SYSTEM_ALERT:       colors.textSecond,
};

export interface NotificationDrawerRef {
  open: () => void;
}

const NotificationDrawer = forwardRef<NotificationDrawerRef>((_, ref) => {
  const { t }    = useTranslation();
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [items,   setItems]   = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const translateY = useRef(new Animated.Value(height)).current;

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

  const markAllRead = (): void => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: Notification }): React.JSX.Element => (
    <View style={[styles.item, item.isRead && styles.itemRead]}>
      <View style={[styles.iconWrap, { backgroundColor: TYPE_COLOR[item.type] + '22' }]}>
        <Ionicons name={TYPE_ICON[item.type]} size={20} color={TYPE_COLOR[item.type]} />
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDesc}  numberOfLines={2}>{item.body}</Text>
        <Text style={styles.itemTime}>{item.time}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </View>
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
          <TouchableOpacity onPress={markAllRead} accessibilityRole="button">
            <Text style={styles.markAllText}>{t('notifications.markAllRead', "Barchasini o'qildi")}</Text>
          </TouchableOpacity>
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
