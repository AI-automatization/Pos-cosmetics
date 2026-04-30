import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth.store';
import { getRoleLevel } from '@/utils/roles';
import type { MoreStackParamList } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────

interface MenuItem {
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly screen: keyof MoreStackParamList | null;
  readonly badge?: string;
}

interface MenuGroup {
  readonly title: string;
  readonly items: readonly MenuItem[];
}

// ─── Constants ────────────────────────────────────────────

const ROLE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  OWNER:   { bg: '#F3E8FF', text: '#7C3AED', label: 'Egasi'     },
  ADMIN:   { bg: '#FEE2E2', text: '#DC2626', label: 'Admin'     },
  MANAGER: { bg: '#EFF6FF', text: '#2563EB', label: 'Menedzher' },
  CASHIER: { bg: '#F0FDF4', text: '#16A34A', label: 'Kassir'    },
  VIEWER:  { bg: '#F3F4F6', text: '#6B7280', label: "Ko'ruvchi" },
};

const INVENTAR_GROUP: MenuGroup = {
  title: 'Inventar',
  items: [
    {
      icon: 'archive-outline',
      title: 'Kirim',
      subtitle: 'Yetkazib beruvchi kirimi',
      screen: 'KirimScreen',
    },
    {
      icon: 'cube-outline',
      title: 'Ombor',
      subtitle: 'Mahsulot zaxiralari',
      screen: 'OmborScreen',
    },
  ],
};

const BIZNES_GROUP: MenuGroup = {
  title: 'Biznes',
  items: [
    {
      icon: 'trending-up-outline',
      title: 'Moliya',
      subtitle: 'Hisobotlar va tahlil',
      screen: null,
    },
    {
      icon: 'people-outline',
      title: 'Nasiya',
      subtitle: 'Qarzlar boshqaruvi',
      screen: null,
    },
    {
      icon: 'people-outline',
      title: 'Mijozlar',
      subtitle: 'Mijozlar ro\'yxati',
      screen: 'CustomersScreen',
    },
    { icon: 'pricetag-outline', title: 'Aksiyalar', subtitle: 'Chegirmalar va aksiyalar', screen: 'PromotionsScreen' },
    { icon: 'document-text-outline', title: 'Hisobotlar', subtitle: 'Moliyaviy hisobotlar', screen: null },
  ],
};

const BOSHQARUV_GROUP: MenuGroup = {
  title: 'Boshqaruv',
  items: [
    {
      icon: 'person-outline',
      title: 'Foydalanuvchilar',
      subtitle: "Tizim a'zolari",
      screen: 'UsersScreen',
    },
    {
      icon: 'business-outline',
      title: 'Filiallar',
      subtitle: 'Filiallar boshqaruvi',
      screen: 'BranchesScreen',
    },
    {
      icon: 'document-text-outline',
      title: 'Audit jurnali',
      subtitle: 'Tizim hodisalari',
      screen: 'AuditLogScreen',
    },
  ],
};

const SOZLAMALAR_GROUP: MenuGroup = {
  title: 'Sozlamalar',
  items: [
    {
      icon: 'settings-outline',
      title: 'Sozlamalar',
      subtitle: 'Ilova sozlamalari',
      screen: 'SettingsScreen',
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getRoleBadge(role: string): { bg: string; text: string; label: string } {
  return ROLE_BADGE[role] ?? { bg: '#F3F4F6', text: '#6B7280', label: role };
}

// ─── MenuRow component ────────────────────────────────────

interface MenuRowProps {
  readonly item: MenuItem;
  readonly isLast: boolean;
  readonly onPress: () => void;
}

function MenuRow({ item, isLast, onPress }: MenuRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color="#374151" />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      {item.badge != null ? (
        <View style={styles.soonBadge}>
          <Text style={styles.soonBadgeText}>{item.badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────

type MoreMenuNavProp = NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;

export default function MoreMenuScreen(): React.JSX.Element {
  const navigation = useNavigation<MoreMenuNavProp>();
  const { user, clearAuth } = useAuthStore();

  const roleLevel = getRoleLevel(user?.role);

  const groups: readonly MenuGroup[] = [
    INVENTAR_GROUP,
    BIZNES_GROUP,
    ...(roleLevel >= 3 ? [BOSHQARUV_GROUP] : []),
    SOZLAMALAR_GROUP,
  ];

  const handlePress = (item: MenuItem): void => {
    // Maxsus navigatsiya — boshqa tab larga o'tish
    if (item.title === 'Moliya') {
      navigation.getParent()?.navigate('Moliya');
      return;
    }
    if (item.title === 'Nasiya') {
      navigation.getParent()?.navigate('Moliya', { screen: 'NasiyaAging' });
      return;
    }
    if (item.title === 'Hisobotlar') {
      navigation.getParent()?.navigate('Moliya' as never, { screen: 'ReportsHub' } as never);
      return;
    }

    if (item.screen == null) {
      Alert.alert('Tez orada', `"${item.title}" bo'limi tez orada qo'shiladi`);
      return;
    }
    navigation.navigate(item.screen);
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Chiqish',
      'Tizimdan chiqmoqchimisiz?',
      [
        { text: 'Bekor', style: 'cancel' },
        { text: 'Chiqish', style: 'destructive', onPress: () => { void clearAuth(); } },
      ],
    );
  };

  const firstName = user?.firstName ?? '';
  const lastName  = user?.lastName  ?? '';
  const roleConfig = getRoleBadge(user?.role ?? '');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ko'proq</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(firstName, lastName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {firstName} {lastName}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg }]}>
              <Text style={[styles.roleBadgeText, { color: roleConfig.text }]}>
                {roleConfig.label}
              </Text>
            </View>
          </View>
          {user?.tenant != null && (
            <View style={styles.branchChip}>
              <Ionicons name="business-outline" size={12} color="#6B7280" />
              <Text style={styles.branchText} numberOfLines={1}>
                {user.tenant.name}
              </Text>
            </View>
          )}
        </View>

        {/* Menu groups */}
        {groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, idx) => (
                <MenuRow
                  key={item.title}
                  item={item}
                  isLast={idx === group.items.length - 1}
                  onPress={() => { handlePress(item); }}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Chiqish */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <View style={styles.logoutIconWrap}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </View>
          <Text style={styles.logoutText}>Chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  scroll: {
    paddingBottom: 40,
  },

  // Profile card
  profileCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  branchText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    maxWidth: 120,
  },

  // Menu group
  group: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  soonBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soonBadgeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // Logout button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    gap: 12,
  },
  logoutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
});
