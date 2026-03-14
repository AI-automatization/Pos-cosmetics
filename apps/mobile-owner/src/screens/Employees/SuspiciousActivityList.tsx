import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SuspiciousActivityAlert } from '../../api/employees.api';
import { formatRelative } from '../../utils/formatDate';
import { Colors, Radii, Shadows } from '../../config/theme';

interface SuspiciousActivityListProps {
  data: SuspiciousActivityAlert[];
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; iconColor: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  high:   { bg: Colors.dangerLight,  text: Colors.danger,  iconColor: Colors.danger,  icon: 'alert-circle' },
  medium: { bg: Colors.warningLight, text: Colors.warning, iconColor: Colors.warning, icon: 'warning' },
  low:    { bg: Colors.infoLight,    text: Colors.info,    iconColor: Colors.info,    icon: 'information-circle' },
};

export default function SuspiciousActivityList({ data }: SuspiciousActivityListProps) {
  const { t } = useTranslation();
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('employees.suspiciousActivity')}</Text>
      <View style={styles.list}>
        {data.map((item) => {
          const cfg = SEVERITY_CONFIG[item.severity] ?? SEVERITY_CONFIG.low;
          return (
            <View key={item.id} style={[styles.card, { borderLeftColor: cfg.iconColor }]}>
              <View style={styles.iconBox}>
                <Ionicons name={cfg.icon} size={20} color={cfg.iconColor} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.type}>{t(`employees.${item.type}`)}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.text }]}>
                      {t(`employees.severity${item.severity.charAt(0).toUpperCase()}${item.severity.slice(1)}`)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.time}>{formatRelative(item.occurredAt)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderLeftWidth: 4,
    padding: 12,
    gap: 10,
    ...Shadows.card,
  },
  iconBox: {
    paddingTop: 1,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  type: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
