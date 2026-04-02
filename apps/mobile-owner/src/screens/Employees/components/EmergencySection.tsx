import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows } from '../../../config/theme';
import SectionHeader from './SectionHeader';
import Field from './Field';
import type { FormState, SetField } from './types';

interface EmergencySectionProps {
  readonly form: FormState;
  readonly set: SetField;
}

export default function EmergencySection({ form, set }: EmergencySectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionHeader icon="🆘" title={t('employees.sectionEmergency')} />
      <Field
        label="Shoshilinch aloqa ismi"
        value={form.emergencyContactName}
        onChangeText={(v) => set('emergencyContactName', v)}
        placeholder="Familiya Ismi (qarindoshi)"
      />
      <Field
        label="Shoshilinch aloqa telefoni"
        value={form.emergencyContactPhone}
        onChangeText={(v) => set('emergencyContactPhone', v)}
        placeholder="+998 91 234 56 78"
        keyboardType="phone-pad"
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
});
