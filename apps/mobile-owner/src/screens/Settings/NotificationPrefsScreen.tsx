import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, SectionList } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NotificationType, NOTIFICATION_TYPE_CONFIG } from '../../notifications/types';

const STORAGE_KEY = 'notification_prefs';

interface Section {
  readonly titleKey: string;
  readonly data: readonly NotificationType[];
}

const SECTIONS: Section[] = [
  {
    titleKey: 'settings.notif_sales',
    data: ['LARGE_SALE', 'SALE_COMPLETED', 'LARGE_REFUND'],
  },
  {
    titleKey: 'settings.notif_inventory',
    data: ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY_WARNING'],
  },
  {
    titleKey: 'settings.notif_staff',
    data: ['SHIFT_OPENED', 'SHIFT_CLOSED', 'SUSPICIOUS_ACTIVITY', 'NEW_EMPLOYEE'],
  },
  {
    titleKey: 'settings.notif_finance',
    data: ['NASIYA_OVERDUE'],
  },
  {
    titleKey: 'settings.notif_system',
    data: ['SYSTEM_ERROR'],
  },
];

const ALL_TYPES = SECTIONS.flatMap((s) => s.data);

function buildDefaults(): Record<NotificationType, boolean> {
  return Object.fromEntries(ALL_TYPES.map((t) => [t, true])) as Record<NotificationType, boolean>;
}

export default function NotificationPrefsScreen() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<Record<NotificationType, boolean>>(buildDefaults);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Record<string, boolean>;
          setEnabled((prev) => ({ ...prev, ...parsed }));
        } catch { /* corrupted data — use defaults */ }
      }
    });
  }, []);

  const handleToggle = (type: NotificationType, val: boolean) => {
    setEnabled((prev) => {
      const next = { ...prev, [type]: val };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const renderItem = ({ item }: { item: NotificationType }) => {
    const config = NOTIFICATION_TYPE_CONFIG[item];
    return (
      <View style={styles.row}>
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={config.color}
          style={styles.icon}
        />
        <Text style={styles.label}>{t(`alerts.${item}`)}</Text>
        <Switch value={enabled[item]} onValueChange={(val) => handleToggle(item, val)} />
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
  );

  return (
    <SectionList
      sections={SECTIONS as Section[]}
      keyExtractor={(item) => item}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      style={styles.container}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  icon: {
    marginRight: 12,
    width: 24,
  },
  label: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
});
