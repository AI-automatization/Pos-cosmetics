import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Employee } from '../../../../api/employees.api';
import { Colors, Radii, Shadows } from '../../../../config/theme';

interface EmployeeActionButtonsProps {
  readonly employee: Employee;
  readonly employeeId: string;
  readonly onRevokePosAccess: () => void;
  readonly onGrantPosAccess: () => void;
  readonly onFire: () => void;
  readonly onDelete: () => void;
  readonly isRevokePending: boolean;
  readonly isGrantPending: boolean;
  readonly isFirePending: boolean;
  readonly isDeletePending: boolean;
}

export default function EmployeeActionButtons({
  employee,
  onRevokePosAccess,
  onGrantPosAccess,
  onFire,
  onDelete,
  isRevokePending,
  isGrantPending,
  isFirePending,
  isDeletePending,
}: EmployeeActionButtonsProps) {
  const { t } = useTranslation();

  const isFired = employee.status === 'fired';

  return (
    <View style={styles.actions}>
      {employee.hasPosAccess ? (
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnWarn]}
          onPress={onRevokePosAccess}
          disabled={isRevokePending}
        >
          <Ionicons name="phone-portrait-outline" size={18} color={Colors.warning} />
          <Text style={[styles.actionBtnText, { color: Colors.warning }]}>
            {t('employees.revokePos')}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSuccess]}
          onPress={onGrantPosAccess}
          disabled={isGrantPending}
        >
          <Ionicons name="phone-portrait-outline" size={18} color={Colors.success} />
          <Text style={[styles.actionBtnText, { color: Colors.success }]}>
            {t('employees.grantPos')}
          </Text>
        </TouchableOpacity>
      )}

      {!isFired && (
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={onFire}
          disabled={isFirePending}
        >
          <Ionicons name="ban-outline" size={18} color={Colors.danger} />
          <Text style={[styles.actionBtnText, { color: Colors.danger }]}>
            {t('employees.fireTitle')}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnDelete]}
        onPress={onDelete}
        disabled={isDeletePending}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.textWhite} />
        <Text style={[styles.actionBtnText, { color: Colors.textWhite }]}>
          {t('employees.deleteTitle')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnWarn: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningLight,
  },
  actionBtnSuccess: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  actionBtnDanger: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  actionBtnDelete: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
});
