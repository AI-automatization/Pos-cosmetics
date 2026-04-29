import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows } from '../../../config/theme';
import SectionHeader from './SectionHeader';
import RoleSelector from './RoleSelector';
import type { FormState, SetField } from './types';

// T-379: hireDate, branchId, branches removed — not supported by backend.

interface WorkSectionProps {
  readonly form: FormState;
  readonly set: SetField;
}

export default function WorkSection({ form, set }: WorkSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionHeader icon="💼" title={t('employees.sectionWork')} />
      <RoleSelector value={form.role} onChange={(r) => set('role', r)} />
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
