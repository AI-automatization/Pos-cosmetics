import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { APP_VERSION } from '../../config';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:       '#F5F5F7',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  secondary:'#6B7280',
  border:   '#F3F4F6',
  primary:  '#5B5BD6',
  red:      '#EF4444',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN:    'Administrator',
  CASHIER:  'Kassir',
  MANAGER:  'Menejer',
  OWNER:    'Egasi',
};

const LANGUAGES = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
] as const;

// ─── Menu Row ──────────────────────────────────────────
function MenuRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  onPress,
  right,
  danger,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={18} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: C.red }]}>{label}</Text>
      <View style={styles.menuRight}>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={C.muted} /> : null)}
      </View>
    </TouchableOpacity>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Main Screen ───────────────────────────────────────
export default function SettingsScreen() {
  const { t, i18n }          = useTranslation();
  const { user, clearAuth }  = useAuthStore();
  const [bluetooth, setBluetooth] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);

  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? (user?.role ?? '—');
  const branchName = user?.tenant?.name ?? '—';
  const fullName = user ? `${user.firstName} ${user.lastName}` : '—';
  const initials = user ? (user.firstName[0] ?? '') + (user.lastName[0] ?? '') : '?';

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobdan chiqmoqchimisiz?',
      [
        { text: 'Bekor', style: 'cancel' },
        { text: 'Chiqish', style: 'destructive', onPress: () => { void clearAuth(); } },
      ],
    );
  };

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
            <Text style={styles.profileAvatarText}>{initials.toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileRole}>{roleLabel}</Text>
            <View style={styles.profileBranch}>
              <Ionicons name="business-outline" size={12} color={C.muted} />
              <Text style={styles.profileBranchText}>{branchName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileEditBtn} activeOpacity={0.7}>
            <Ionicons name="pencil-outline" size={16} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Language */}
        <SectionTitle title="Til" />
        <Card>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang, idx) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langBtn,
                  i18n.language === lang.code && styles.langBtnActive,
                  idx === 0 && { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
                  idx === LANGUAGES.length - 1 && { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
                ]}
                onPress={() => { void i18n.changeLanguage(lang.code); }}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.langText,
                  i18n.language === lang.code && styles.langTextActive,
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Printer */}
        <SectionTitle title="Printer sozlamalari" />
        <Card>
          <MenuRow
            icon="bluetooth"
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            label="Bluetooth printer"
            right={
              <Switch
                value={bluetooth}
                onValueChange={setBluetooth}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={C.white}
              />
            }
          />
          <Divider />
          <MenuRow
            icon="printer-outline"
            iconBg={C.primary + '15'}
            iconColor={C.primary}
            label="Printer tanlash"
            value={bluetooth ? 'Epson TM-T20' : 'Ulanmagan'}
            onPress={bluetooth ? () => Alert.alert('Printer', 'Epson TM-T20 tanlandi') : undefined}
          />
          <Divider />
          <MenuRow
            icon="receipt-outline"
            iconBg="#D1FAE5"
            iconColor="#059669"
            label="Avtomatik chop etish"
            right={
              <Switch
                value={autoPrint}
                onValueChange={setAutoPrint}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={C.white}
              />
            }
          />
        </Card>

        {/* App info */}
        <SectionTitle title="Dastur haqida" />
        <Card>
          <MenuRow
            icon="information-outline"
            iconBg="#F3F4F6"
            iconColor={C.secondary}
            label="Versiya"
            value={`v${APP_VERSION}`}
          />
          <Divider />
          <MenuRow
            icon="shield-check-outline"
            iconBg="#D1FAE5"
            iconColor="#059669"
            label="Maxfiylik siyosati"
            onPress={() => Alert.alert('Maxfiylik', 'RAOS — Retail & Asset Operating System')}
          />
          <Divider />
          <MenuRow
            icon="help-circle-outline"
            iconBg="#FEF3C7"
            iconColor="#D97706"
            label="Yordam"
            onPress={() => Alert.alert('Yordam', 'Telegram: @raos_support')}
          />
        </Card>

        {/* Logout */}
        <Card>
          <MenuRow
            icon="logout"
            iconBg="#FEE2E2"
            iconColor={C.red}
            label="Chiqish"
            onPress={handleLogout}
            danger
          />
        </Card>

        <Text style={styles.copyright}>RAOS © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },

  scroll: { paddingBottom: 40, gap: 8, paddingTop: 16 },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: C.primary,
    borderRadius: 16, padding: 16, gap: 14,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 20, fontWeight: '800', color: C.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: C.white },
  profileRole: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  profileBranch: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  profileBranchText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  profileEditBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Section
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 52 },

  // Menu row
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, gap: 12,
  },
  menuIcon: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: C.text },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, color: C.muted },

  // Language
  langRow: { flexDirection: 'row', margin: 12 },
  langBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
  },
  langBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  langText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  langTextActive: { color: C.white },

  copyright: { textAlign: 'center', fontSize: 12, color: C.border, paddingTop: 8 },
});
