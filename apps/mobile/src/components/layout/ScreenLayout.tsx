import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth.store';
import { colors, spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import NotificationBell from '@/components/layout/NotificationBell';

// title saqlanadi — mavjud screen lar TypeScript xatosiz ishlashi uchun (render qilinmaydi)
interface ScreenLayoutProps {
  title?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  scrollable?: boolean;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showNotifications?: boolean;
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
  showBack = false,
  onBack,
  showNotifications = true,
}: ScreenLayoutProps): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();

  const initials = user ? getInitials(`${user.firstName} ${user.lastName}`) : '?';
  const roleLine = user?.role ?? '';

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
        {/* Orqaga tugma (ixtiyoriy) */}
        {showBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

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
              {user ? `${user.firstName} ${user.lastName}` : ''}
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

          {/* Bell + badge + drawer (hidden via showNotifications) */}
          {showNotifications && <NotificationBell />}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
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
