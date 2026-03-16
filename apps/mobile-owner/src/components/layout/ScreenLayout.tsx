import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import HeaderBranchSelector from './HeaderBranchSelector';
import { Colors, Shadows, Radii } from '../../config/theme';
import { useAlertsStore } from '../../store/alerts.store';

interface ScreenLayoutProps {
  title: string;
  /** Dashboard mode: RAOS logo left + center branch pill + bell right */
  logoMode?: boolean;
  showBranchSelector?: boolean;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

function BellIcon() {
  const unreadCount = useAlertsStore((s) => s.unreadCount);
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.bellBtn}
      onPress={() => navigation.navigate('Alerts' as never)}
      activeOpacity={0.7}
    >
      <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
      {unreadCount > 0 && (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : String(unreadCount)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ScreenLayout({
  title,
  logoMode = false,
  showBranchSelector = true,
  children,
  rightAction,
}: ScreenLayoutProps) {
  if (logoMode) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.logoHeader}>
          {/* Left: RAOS logo */}
          <View style={styles.logoLeft}>
            <View style={styles.logoIcon}>
              <Ionicons name="trending-up" size={16} color={Colors.textWhite} />
            </View>
            <Text style={styles.logoText}>RAOS</Text>
          </View>

          {/* Center: Branch selector pill */}
          <View style={styles.logoCenter}>
            <HeaderBranchSelector />
          </View>

          {/* Right: Bell icon */}
          <View style={styles.logoRight}>
            <BellIcon />
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.headerRight}>
          {showBranchSelector && <HeaderBranchSelector />}
          {rightAction}
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  // Logo mode header (Dashboard)
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  logoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  logoCenter: {
    flex: 2,
    alignItems: 'center',
  },
  logoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontWeight: '700',
  },
  // Standard header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
  },
});
