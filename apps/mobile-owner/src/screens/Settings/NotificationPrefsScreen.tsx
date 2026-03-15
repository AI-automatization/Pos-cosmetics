import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NotificationType } from '../../notifications/types';

const NOTIFICATION_TYPES: NotificationType[] = [
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'EXPIRY_WARNING',
  'LARGE_REFUND',
  'SUSPICIOUS_ACTIVITY',
  'SHIFT_CLOSED',
  'SYSTEM_ERROR',
  'NASIYA_OVERDUE',
];

export default function NotificationPrefsScreen() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = React.useState<Record<NotificationType, boolean>>(
    Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t, true])) as Record<NotificationType, boolean>,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
      {NOTIFICATION_TYPES.map((type) => (
        <View key={type} style={styles.row}>
          <Text style={styles.label}>{t(`alerts.${type}`)}</Text>
          <Switch
            value={enabled[type]}
            onValueChange={(val) => setEnabled((prev) => ({ ...prev, [type]: val }))}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { fontSize: 15, color: '#374151', flex: 1 },
});
