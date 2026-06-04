import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth.store';
import { useSettingsStore } from '../../store/settings.store';
import { APP_VERSION } from '../../config';
import type { MoreStackParamList } from '../../navigation/types';
import { C, ROLE_LABELS, LANGUAGES, THEMES, AUTO_LOCK_OPTIONS } from './settings.constants';
import type { ThemeOption } from './settings.constants';
import { MenuRow, SectionTitle, Card, Divider, SegmentControl } from './SettingsComponents';
import { styles } from './SettingsScreen.styles';

type NavigationProp = NativeStackNavigationProp<MoreStackParamList>;

// ─── Main Screen ───────────────────────────────────────
export default function SettingsScreen() {
  const { t, i18n }      = useTranslation();
  const { user, logout } = useAuthStore();
  const navigation       = useNavigation<NavigationProp>();

  const {
    theme,
    biometricEnabled,
    autoLockMinutes,
    setTheme,
    setBiometricEnabled,
    setAutoLockMinutes,
  } = useSettingsStore();

  const isAdmin    = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const isOwner    = user?.role === 'OWNER';
  const roleLabel  = ROLE_LABELS[user?.role ?? ''] ?? (user?.role ?? '—');
  const branchName = user?.tenant?.name ?? '—';
  const fullName   = user ? `${user.firstName} ${user.lastName}` : '—';
  const initials   = user
    ? ((user.firstName[0] ?? '') + (user.lastName[0] ?? '')).toUpperCase()
    : '?';

  const autoLockLabel =
    AUTO_LOCK_OPTIONS.find((o) => o.minutes === autoLockMinutes)?.label ?? '—';

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => { void logout(); },
        },
      ],
    );
  };

  const handleAutoLockSelect = () => {
    Alert.alert(
      t('settings.autoLock'),
      undefined,
      [
        ...AUTO_LOCK_OPTIONS.map((opt) => ({
          text: opt.label,
          onPress: () => setAutoLockMinutes(opt.minutes),
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ],
    );
  };

  const currentLangCode = i18n.language as (typeof LANGUAGES)[number]['value'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileRole}>{roleLabel}</Text>
            <View style={styles.profileBranch}>
              <Ionicons name="business-outline" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.profileBranchText}>{branchName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileEditBtn} activeOpacity={0.7}>
            <Text style={styles.profileEditText}>{t('settings.editProfile')}</Text>
            <Ionicons name="pencil-outline" size={14} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* ── Hisob ── */}
        <SectionTitle title={t('settings.sectionAccount')} />
        <Card>
          <MenuRow
            icon="person-circle-outline"
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            label={t('settings.profile')}
            subtitle={t('settings.profileSubtitle')}
            onPress={() => Alert.alert(t('settings.profile'))}
          />
          {isAdmin && (
            <>
              <Divider />
              <MenuRow
                icon="business-outline"
                iconBg="#EEF2FF"
                iconColor="#6366F1"
                label={t('settings.branches')}
                subtitle={branchName}
                onPress={() => navigation.navigate('BranchesScreen')}
              />
            </>
          )}
          <Divider />
          <MenuRow
            icon="notifications-outline"
            iconBg="#FFF7ED"
            iconColor="#D97706"
            label={t('settings.notifications')}
            subtitle={t('settings.notificationsSubtitle')}
            onPress={() => Alert.alert(t('settings.notifications'))}
          />
        </Card>

        {/* ── Obuna (faqat OWNER) ── */}
        {isOwner && (
          <>
            <SectionTitle title="OBUNA VA TARIF" />
            <Card>
              <MenuRow
                icon="card-outline"
                iconBg="#F5F3FF"
                iconColor="#7C3AED"
                label="Hisob va tarif"
                subtitle="Joriy obuna holati va limitlar"
                onPress={() => navigation.navigate('BillingScreen')}
              />
            </Card>
          </>
        )}

        {/* ── Ilova ── */}
        <SectionTitle title={t('settings.sectionApp')} />
        <Card>
          {/* Language row */}
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, styles.menuIconBlue]}>
              <Ionicons name="language-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>{t('settings.language')}</Text>
            </View>
            <SegmentControl<(typeof LANGUAGES)[number]['value']>
              options={LANGUAGES}
              selected={currentLangCode}
              onSelect={(lang) => { void i18n.changeLanguage(lang); }}
            />
          </View>

          <Divider />

          {/* Theme row */}
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, styles.menuIconPurple]}>
              <Ionicons name="moon-outline" size={18} color="#7C3AED" />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>{t('settings.theme')}</Text>
            </View>
            <SegmentControl<ThemeOption>
              options={THEMES}
              selected={theme}
              onSelect={setTheme}
            />
          </View>

          <Divider />
          <MenuRow
            icon="print-outline"
            iconBg="#D1FAE5"
            iconColor="#059669"
            label={t('settings.printer')}
            subtitle={t('settings.printerSubtitle')}
            onPress={() => navigation.navigate('PrinterScreen')}
          />
        </Card>

        {/* ── Xavfsizlik ── */}
        <SectionTitle title={t('settings.sectionSecurity')} />
        <Card>
          <MenuRow
            icon="finger-print-outline"
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            label={t('settings.biometric')}
            subtitle={t('settings.biometricSubtitle')}
            showChevron={false}
            right={
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: C.border, true: '#2563EB' }}
                thumbColor={C.white}
              />
            }
          />
          <Divider />
          <MenuRow
            icon="lock-closed-outline"
            iconBg="#F3F4F6"
            iconColor={C.secondary}
            label={t('settings.autoLock')}
            subtitle={t('settings.autoLockSubtitle')}
            value={autoLockLabel}
            onPress={handleAutoLockSelect}
          />
        </Card>

        {/* ── Ma'lumot ── */}
        <SectionTitle title={t('settings.sectionInfo')} />
        <Card>
          <MenuRow
            icon="information-circle-outline"
            iconBg="#F3F4F6"
            iconColor={C.secondary}
            label={t('settings.version')}
            value={`v${APP_VERSION}`}
            showChevron={false}
          />
          <Divider />
          <MenuRow
            icon="shield-checkmark-outline"
            iconBg="#D1FAE5"
            iconColor="#059669"
            label={t('settings.privacy')}
            onPress={() =>
              Alert.alert(t('settings.privacy'), 'RAOS — Retail & Asset Operating System')
            }
          />
          <Divider />
          <MenuRow
            icon="help-circle-outline"
            iconBg="#FEF3C7"
            iconColor="#D97706"
            label={t('settings.help')}
            onPress={() =>
              Alert.alert(t('settings.help'), 'Telegram: @raos_support')
            }
          />
        </Card>

        {/* Logout */}
        <Card>
          <MenuRow
            icon="log-out-outline"
            iconBg="#FEE2E2"
            iconColor={C.red}
            label={t('settings.logout')}
            onPress={handleLogout}
            danger
            showChevron={false}
          />
        </Card>

        <Text style={styles.copyright}>RAOS © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
