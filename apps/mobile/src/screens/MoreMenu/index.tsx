import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth.store';
import { getRoleLevel } from '@/utils/roles';
import type { MoreStackParamList } from '../../navigation/types';
import {
  INVENTAR_GROUP,
  BIZNES_GROUP,
  BOSHQARUV_GROUP,
  OWNER_GROUP,
  WAREHOUSE_GROUP,
  SOZLAMALAR_GROUP,
  getInitials,
  getRoleBadge,
} from './menuGroups';
import type { MenuItem, MenuGroup } from './menuGroups';
import { MenuRow } from './MenuRow';
import { styles } from './styles';

// ─── Main Screen ──────────────────────────────────────────

type MoreMenuNavProp = NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;

export default function MoreMenuScreen(): React.JSX.Element {
  const navigation = useNavigation<MoreMenuNavProp>();
  const { user, clearAuth } = useAuthStore();

  const roleLevel = getRoleLevel(user?.role);
  const isCashier = user?.role === 'CASHIER';

  const groups = useMemo<readonly MenuGroup[]>(
    () => [
      // INVENTAR guruhi — CASHIER faqat Ombor + Kelgan mahsulotlar ko'radi
      {
        ...INVENTAR_GROUP,
        items: isCashier
          ? [
              ...INVENTAR_GROUP.items.filter(i => i.title === 'Ombor'),
              { icon: 'download-outline' as const, title: 'Kelgan mahsulotlar', subtitle: 'Qabul qilish kutilmoqda', screen: 'IncomingTransfersScreen' as keyof MoreStackParamList },
            ]
          : roleLevel >= 3
            ? [...INVENTAR_GROUP.items, { icon: 'warning-outline' as const, title: 'Kam qolgan', subtitle: 'Zaxira kam mahsulotlar', screen: 'LowStockList' as keyof MoreStackParamList }]
            : INVENTAR_GROUP.items,
      },
      ...(user?.role === 'WAREHOUSE' ? [WAREHOUSE_GROUP] : []),
      // BIZNES guruhi — WAREHOUSE ko'rmaydi; CASHIER faqat Mijozlar va Aksiyalar
      ...(user?.role === 'WAREHOUSE' ? [] : [{
        ...BIZNES_GROUP,
        items: isCashier
          ? [
              // CASHIER faqat Mijozlar va Aksiyalar ko'radi
              BIZNES_GROUP.items[2]!, // Mijozlar
              BIZNES_GROUP.items[3]!, // Aksiyalar
            ]
          : [
              ...BIZNES_GROUP.items.slice(0, 4),
              ...(roleLevel >= 4
                ? [{ icon: 'pricetags-outline' as const, title: 'Chegirmalar', subtitle: 'Chegirma yaratish va boshqaruv', screen: 'ChegirmaScreen' as keyof MoreStackParamList }]
                : []),
              ...(roleLevel >= 3
                ? [
                    { icon: 'checkmark-circle-outline' as const, title: 'Vazifalar', subtitle: 'Topshiriqlar boshqaruvi', screen: 'TasksScreen' as keyof MoreStackParamList },
                    { icon: 'receipt-outline' as const, title: 'Buyurtmalar', subtitle: 'Sotuv tarixi', screen: 'SalesOrdersScreen' as keyof MoreStackParamList },
                    { icon: 'return-down-back-outline' as const, title: 'Qaytarish', subtitle: 'Mahsulot qaytarish', screen: 'SalesReturnsScreen' as keyof MoreStackParamList },
                  ]
                : []),
              ...BIZNES_GROUP.items.slice(4),
            ],
      }]),
      ...(roleLevel >= 3 ? [{
        ...BOSHQARUV_GROUP,
        items: roleLevel >= 4
          ? [
              ...BOSHQARUV_GROUP.items,
              {
                icon: 'pulse-outline' as const,
                title: 'Sistema holati',
                subtitle: 'Xizmatlar va xatolar holati',
                screen: 'SystemHealthScreen' as keyof MoreStackParamList,
              },
            ]
          : BOSHQARUV_GROUP.items,
      }] : []),
      ...(roleLevel >= 4 ? [OWNER_GROUP] : []),
      SOZLAMALAR_GROUP,
    ],
    [roleLevel, user?.role, isCashier],
  );

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
      navigation.getParent()?.navigate('Moliya', { screen: 'ReportsHub' });
      return;
    }

    if (item.screen == null) {
      Alert.alert('Tez orada', `"${item.title}" bo'limi tez orada qo'shiladi`);
      return;
    }
    navigation.navigate(item.screen as never);
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
