import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows } from '../../../config/theme';
import SectionHeader from './SectionHeader';
import ToggleRow from './ToggleRow';
import type { FormState, SetField } from './types';

interface AccessSectionProps {
  readonly form: FormState;
  readonly set: SetField;
}

export default function AccessSection({ form, set }: AccessSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionHeader icon="🛡️" title={t('employees.sectionAccess')} />
      <ToggleRow
        label={t('employees.posAccess')}
        sublabel="Kassir mobil ilovasi (POS)"
        value={form.hasPosAccess}
        onChange={(v) => set('hasPosAccess', v)}
      />
      <View style={styles.divider} />
      <ToggleRow
        label={t('employees.adminAccess')}
        sublabel="Admin panel (web)"
        value={form.hasAdminAccess}
        onChange={(v) => set('hasAdminAccess', v)}
      />
      <View style={styles.divider} />
      <ToggleRow
        label={t('employees.reportsAccess')}
        sublabel="Hisobotlarni ko'rish"
        value={form.hasReportsAccess}
        onChange={(v) => set('hasReportsAccess', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.bgSurface,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
});
