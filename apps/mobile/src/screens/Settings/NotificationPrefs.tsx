import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';

export default function NotificationPrefsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [lowStockEnabled, setLowStockEnabled] = useState(true);
  const [largeSaleEnabled, setLargeSaleEnabled] = useState(true);
  const [rentalEnabled, setRentalEnabled] = useState(true);
  const [suspiciousEnabled, setSuspiciousEnabled] = useState(true);

  return (
    <ScreenLayout>
      <Card>
        <Row
          label={t('settings.enablePush')}
          value={pushEnabled}
          onChange={setPushEnabled}
        />
        <View style={styles.divider} />
        <Row
          label={t('alerts.lowStock')}
          value={lowStockEnabled}
          onChange={setLowStockEnabled}
        />
        <View style={styles.divider} />
        <Row
          label={t('alerts.largeSale')}
          value={largeSaleEnabled}
          onChange={setLargeSaleEnabled}
        />
        <View style={styles.divider} />
        <Row
          label={t('alerts.rentalDue')}
          value={rentalEnabled}
          onChange={setRentalEnabled}
        />
        <View style={styles.divider} />
        <Row
          label={t('alerts.suspicious')}
          value={suspiciousEnabled}
          onChange={setSuspiciousEnabled}
        />
      </Card>
    </ScreenLayout>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={value ? '#1a56db' : '#9ca3af'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 56,
  },
  label: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
