import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../../navigation/types';
import { alertsApi } from '../../api/alerts.api';
import type { Alert, AlertType } from '../../api/alerts.api';
import { useFocusEffect } from '@react-navigation/native';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = '#2563EB';

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

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Hozir';
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} soat oldin`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} kun oldin`;
}

// ─── NotificationRow ──────────────────────────────────────────────────────────

interface NotificationRowProps {
  readonly item: Alert;
  readonly onPress: (item: Alert) => void;
}

const NotificationRow = React.memo(function NotificationRow({
  item,
  onPress,
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
        <Text style={styles.rowTime}>{formatTime(item.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
});

// ─── EmptyNotifications ───────────────────────────────────────────────────────

function EmptyNotifications(): React.JSX.Element {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Bildirishnomalar yo'q</Text>
      <Text style={styles.emptySubtitle}>Yangi bildirishnomalar bu yerda ko'rinadi</Text>
    </View>
  );
}

// ─── NotificationsScreen ──────────────────────────────────────────────────────

export default function NotificationsScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();

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
          accessibilityLabel="Orqaga"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirishnomalar</Text>
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
          <Text style={styles.errorText}>Yuklashda xatolik</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => void loadAlerts()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={handlePress} />
          )}
          ListEmptyComponent={<EmptyNotifications />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginRight: 4,
  },
  headerSpacer: {
    width: 40,
  },

  // List
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },

  // Row
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rowUnread: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    borderColor: '#DBEAFE',
  },
  iconWrapper: {
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  rowMessage: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  rowTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Center states
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
