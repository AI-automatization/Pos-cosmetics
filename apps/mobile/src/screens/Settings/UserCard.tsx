import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ─────────────────────────────────────────────

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';

export interface AppUser {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly lastLogin: string | null;
  readonly createdAt: string;
}

// ─── Role config ───────────────────────────────────────

export const ROLE_CONFIG: Record<UserRole, { bg: string; text: string; label: string }> = {
  OWNER:   { bg: '#F3E8FF', text: '#7C3AED', label: 'Egasi'      },
  ADMIN:   { bg: '#FEE2E2', text: '#DC2626', label: 'Admin'      },
  MANAGER: { bg: '#EFF6FF', text: '#2563EB', label: 'Menedzher'  },
  CASHIER: { bg: '#F0FDF4', text: '#16A34A', label: 'Kassir'     },
  VIEWER:  { bg: '#F3F4F6', text: '#6B7280', label: "Ko'ruvchi"  },
};

// ─── Props ─────────────────────────────────────────────

interface UserCardProps {
  readonly user: AppUser;
  readonly onEdit: (user: AppUser) => void;
  readonly onToggleActive: (user: AppUser) => void;
}

// ─── Helpers ───────────────────────────────────────────

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function fmtLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return 'Hali kirmagan';
  return new Date(lastLogin).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Component ─────────────────────────────────────────

export default function UserCard({ user, onEdit, onToggleActive }: UserCardProps) {
  const role = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.VIEWER;

  const handleMenu = () => {
    Alert.alert(
      `${user.firstName} ${user.lastName}`,
      'Amalni tanlang',
      [
        { text: 'Tahrirlash', onPress: () => onEdit(user) },
        {
          text: user.isActive ? 'Bloklash' : 'Faollashtirish',
          style: user.isActive ? 'destructive' : 'default',
          onPress: () => onToggleActive(user),
        },
        { text: 'Bekor', style: 'cancel' },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: role.bg }]}>
        <Text style={[styles.avatarText, { color: role.text }]}>
          {getInitials(user.firstName, user.lastName)}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Name + status */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.firstName} {user.lastName}
          </Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: user.isActive ? '#16A34A' : '#9CA3AF' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: user.isActive ? '#16A34A' : '#9CA3AF' },
            ]}
          >
            {user.isActive ? 'Faol' : 'Nofaol'}
          </Text>
        </View>

        {/* Phone */}
        {user.phone ? (
          <Text style={styles.phone} numberOfLines={1}>{user.phone}</Text>
        ) : (
          <Text style={styles.phoneMuted}>Telefon yo'q</Text>
        )}

        {/* Role badge + last login */}
        <View style={styles.metaRow}>
          <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
            <Text style={[styles.roleBadgeText, { color: role.text }]}>
              {role.label}
            </Text>
          </View>
          <Text style={styles.lastLogin}>{fmtLastLogin(user.lastLogin)}</Text>
        </View>
      </View>

      {/* Menu button */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={handleMenu}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
  },
  phoneMuted: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lastLogin: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
