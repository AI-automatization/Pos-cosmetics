import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { alertsApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { colors, spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Alert } from '@/api/alerts.api';
import NotificationDrawer from '@/components/layout/NotificationDrawer';
import type { NotificationDrawerRef } from '@/components/layout/NotificationDrawer';

// title saqlanadi — mavjud screen lar TypeScript xatosiz ishlashi uchun (render qilinmaydi)
interface ScreenLayoutProps {
  title?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  scrollable?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ScreenLayout({
  children,
  onRefresh,
  isRefreshing = false,
  scrollable = true,
}: ScreenLayoutProps): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const drawerRef = useRef<NotificationDrawerRef>(null);

  const { data: alerts } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: safeQueryFn<Alert[]>(() => alertsApi.getAll(), []),
    refetchInterval: 30_000,
  });

  const unreadCount = alerts?.filter((a) => !a.isRead).length ?? 0;
  const initials = user ? getInitials(user.name) : '?';
  const roleLine = [user?.role, user?.branchId ? user.branchId.slice(0, 8) : null]
    .filter(Boolean)
    .join(' • ');

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        {/* Chap: Avatar blok */}
        <TouchableOpacity
          style={styles.avatarBlock}
          onPress={() => navigation.navigate('Settings')}
          accessibilityRole="button"
        >
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? ''}
            </Text>
            <Text style={styles.userMeta} numberOfLines={1}>
              {roleLine}
            </Text>
          </View>
        </TouchableOpacity>

        {/* O'ng: 3 icon */}
        <View style={styles.icons}>
          {/* AI */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AIInsights')}
            accessibilityRole="button"
          >
            <Ionicons name="bulb-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Bell + badge */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => drawerRef.current?.open()}
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : String(unreadCount)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {content}
      <NotificationDrawer ref={drawerRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minHeight: 48,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userMeta: {
    fontSize: 12,
    color: colors.textSecond,
    marginTop: 1,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
});
