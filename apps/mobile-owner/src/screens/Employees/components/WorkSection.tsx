import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows } from '../../../config/theme';
import SectionHeader from './SectionHeader';
import Field from './Field';
import RoleSelector from './RoleSelector';
import type { FormState, SetField } from './types';

interface Branch {
  readonly id: string;
  readonly name: string;
}

interface WorkSectionProps {
  readonly form: FormState;
  readonly set: SetField;
  readonly branches: Branch[];
  readonly selectedBranchId: string;
  readonly onSelectBranch: (id: string) => void;
}

export default function WorkSection({
  form,
  set,
  branches,
  selectedBranchId,
  onSelectBranch,
}: WorkSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionHeader icon="💼" title={t('employees.sectionWork')} />
      <Field
        label="Ishga kirish sanasi"
        required
        value={form.hireDate}
        onChangeText={(v) => set('hireDate', v)}
        placeholder="2024-01-15"
      />
      <RoleSelector value={form.role} onChange={(r) => set('role', r)} />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          Filial <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.branchRow}>
          {branches.length > 0 ? (
            branches.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.roleBtn,
                  selectedBranchId === b.id && styles.roleBtnActive,
                ]}
                onPress={() => onSelectBranch(b.id)}
              >
                <Text
                  style={[
                    styles.roleBtnText,
                    selectedBranchId === b.id && styles.roleBtnTextActive,
                  ]}
                >
                  {b.name}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noBranch}>Filiallar yuklanmagan</Text>
          )}
        </View>
      </View>
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
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.danger,
  },
  branchRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSubtle,
  },
  roleBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleBtnTextActive: {
    color: Colors.primary,
  },
  noBranch: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
