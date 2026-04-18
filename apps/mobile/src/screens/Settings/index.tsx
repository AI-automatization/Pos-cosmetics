import React from 'react';
import {
  View,
  Text,
  StyleSheet,
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

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#E5E7EB',
  primary:   '#2563EB',
  red:       '#DC2626',
} as const;

// ─── Constants ─────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  ADMIN:   'Administrator',
  CASHIER: 'Kassir',
  MANAGER: 'Menejer',
  OWNER:   'Egasi',
};

const LANGUAGES = [
  { value: 'uz', label: "O'zbek" },
  { value: 'ru', label: 'Рус' },
  { value: 'en', label: 'EN' },
] as const;

type ThemeOption = 'light' | 'dark' | 'system';
const THEMES: Array<{ value: ThemeOption; label: string }> = [
  { value: 'light',  label: "Yorug'" },
  { value: 'dark',   label: "Qorong'u" },
  { value: 'system', label: 'Tizim' },
];

const AUTO_LOCK_OPTIONS: Array<{ minutes: 15 | 30 | 60; label: string }> = [
  { minutes: 15, label: '15 daqiqa' },
  { minutes: 30, label: '30 daqiqa' },
  { minutes: 60, label: '1 soat' },
];

type NavigationProp = NativeStackNavigationProp<MoreStackParamList>;

// ─── Sub-components ────────────────────────────────────

interface MenuRowProps {
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly iconBg: string;
  readonly iconColor: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly value?: string;
  readonly onPress?: () => void;
  readonly right?: React.ReactNode;
  readonly danger?: boolean;
  readonly showChevron?: boolean;
}

function MenuRow({
  icon,
  iconBg,
  iconColor,
  label,
  subtitle,
  value,
  onPress,
  right,
  danger = false,
  showChevron,
}: MenuRowProps) {
  const hasAction = Boolean(onPress);
  const chevronVisible = showChevron !== undefined ? showChevron : hasAction;

  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={hasAction ? 0.7 : 1}
      disabled={!hasAction}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.menuLabelContainer}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.menuRight}>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        {right ?? (chevronVisible ? (
          <Ionicons name="chevron-forward" size={16} color={C.muted} />
        ) : null)}
      </View>
    </TouchableOpacity>
  );
}

function SectionTitle({ title }: { readonly title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Card({ children }: { readonly children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

interface SegmentControlProps<T extends string> {
  readonly options: ReadonlyArray<{ value: T; label: string }>;
  readonly selected: T;
  readonly onSelect: (value: T) => void;
}

function SegmentControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentControlProps<T>) {
  return (
    <View style={styles.segmentRow}>
      {options.map((opt, idx) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segmentBtn,
            selected === opt.value && styles.segmentBtnActive,
            idx === 0 && styles.segmentBtnFirst,
            idx === options.length - 1 && styles.segmentBtnLast,
          ]}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.segmentText,
              selected === opt.value && styles.segmentTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function SettingsScreen() {
  const { t, i18n }         = useTranslation();
  const { user, clearAuth } = useAuthStore();
  const navigation          = useNavigation<NavigationProp>();

  const {
    theme,
    biometricEnabled,
    autoLockMinutes,
    setTheme,
    setBiometricEnabled,
    setAutoLockMinutes,
  } = useSettingsStore();

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
          onPress: () => { void clearAuth(); },
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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
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
          <Divider />
          <MenuRow
            icon="business-outline"
            iconBg="#EEF2FF"
            iconColor="#6366F1"
            label={t('settings.branches')}
            subtitle={branchName}
            onPress={() => navigation.navigate('BranchesScreen')}
          />
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

        {/* ── Ilova ── */}
        <SectionTitle title={t('settings.sectionApp')} />
        <Card>
          {/* Language row */}
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
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
            <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
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
            onPress={() => Alert.alert(t('common.comingSoon'))}
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

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },

  scroll: {
    paddingBottom: 40,
    gap: 8,
    paddingTop: 16,
  },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  profileRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  profileBranch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profileBranchText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  profileEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.white,
  },

  // Section title
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 52,
  },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabelContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
  },
  menuLabelDanger: {
    color: C.red,
  },
  menuSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    color: C.muted,
  },

  // Segment control
  segmentRow: {
    flexDirection: 'row',
  },
  segmentBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  segmentBtnFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentBtnLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
  },
  segmentTextActive: {
    color: C.white,
  },

  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: C.border,
    paddingTop: 8,
  },
});
