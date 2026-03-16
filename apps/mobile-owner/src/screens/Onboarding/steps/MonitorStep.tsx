import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function MonitorStep() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.illustration} />
      <Text style={styles.title}>{t('onboarding.monitor.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.monitor.subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16, paddingHorizontal: 16 },
  illustration: { width: 160, height: 160, backgroundColor: '#DCFCE7', borderRadius: 80, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
});
