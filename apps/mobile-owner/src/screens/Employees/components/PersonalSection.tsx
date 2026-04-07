import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows } from '../../../config/theme';
import SectionHeader from './SectionHeader';
import Field from './Field';
import type { FormState, SetField } from './types';

interface PersonalSectionProps {
  readonly form: FormState;
  readonly set: SetField;
}

export default function PersonalSection({ form, set }: PersonalSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionHeader icon="👤" title={t('employees.sectionPersonal')} />
      <Field
        label="Ism"
        required
        value={form.firstName}
        onChangeText={(v) => set('firstName', v)}
        placeholder="Sarvar"
      />
      <Field
        label="Familiya"
        required
        value={form.lastName}
        onChangeText={(v) => set('lastName', v)}
        placeholder="Qodirov"
      />
      <Field
        label="Telefon"
        required
        value={form.phone}
        onChangeText={(v) => set('phone', v)}
        placeholder="+998 90 123 45 67"
        keyboardType="phone-pad"
      />
      <Field
        label="Email"
        value={form.email}
        onChangeText={(v) => set('email', v)}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Tug'ilgan sana"
        value={form.dateOfBirth}
        onChangeText={(v) => set('dateOfBirth', v)}
        placeholder="1995-07-15"
      />
      <Field
        label="Pasport / ID"
        value={form.passportId}
        onChangeText={(v) => set('passportId', v)}
        placeholder="AA 1234567"
        autoCapitalize="characters"
      />
      <Field
        label="Manzil"
        value={form.address}
        onChangeText={(v) => set('address', v)}
        placeholder="Toshkent, Chilonzor"
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
