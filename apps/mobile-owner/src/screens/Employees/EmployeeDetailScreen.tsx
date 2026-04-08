import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EmployeesStackParamList } from '../../navigation/types';
import {
  useEmployee,
  useUpdateEmployeeStatus,
  useRevokePosAccess,
  useGrantPosAccess,
  useDeleteEmployee,
} from '../../hooks/useEmployees';
import { Employee } from '../../api/employees.api';
import { Colors } from '../../config/theme';
import {
  EmployeeDetailHeader,
  EmployeeAvatarSection,
  EmployeeBioCard,
  EmployeeAccessCard,
  EmployeePerformanceCard,
  EmployeeSuspiciousCard,
  EmployeeActionButtons,
} from './components/detail';

type Route = RouteProp<EmployeesStackParamList, 'EmployeeDetail'>;
type Nav = NativeStackNavigationProp<EmployeesStackParamList, 'EmployeeDetail'>;

// ─── Mock data fallback ───────────────────────────────────────────────────────

const MOCK_PROFILE: Employee = {
  id: 'e1',
  firstName: 'Sarvar',
  lastName: 'Qodirov',
  fullName: 'Sarvar Qodirov',
  phone: '+998 90 123 45 67',
  email: 'sarvar.qodirov@gmail.com',
  dateOfBirth: '1995-07-15',
  passportId: 'AA 1234567',
  address: 'Toshkent, Chilonzor, 12-kvartal',
  hireDate: '2023-06-01',
  role: 'cashier',
  branchId: 'b1',
  branchName: 'Chilonzor',
  status: 'active',
  login: 'sarvar.kassir',
  photoUrl: null,
  hasPosAccess: true,
  hasAdminAccess: false,
  hasReportsAccess: false,
  emergencyContactName: 'Kamola Qodirova (singlisi)',
  emergencyContactPhone: '+998 91 234 56 78',
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EmployeeDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { employeeId, employeeName } = route.params;

  const { profile, performance, suspicious } = useEmployee(employeeId);
  const updateStatus = useUpdateEmployeeStatus();
  const revokePosAccess = useRevokePosAccess();
  const grantPosAccess = useGrantPosAccess();
  const deleteEmployee = useDeleteEmployee();

  const emp = profile.data ?? MOCK_PROFILE;
  const perf = performance.data;
  const suspAlerts = suspicious.data ?? [];

  const handleRefresh = async () => {
    await Promise.all([profile.refetch(), performance.refetch(), suspicious.refetch()]);
  };

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleRevokePosAccess = () => {
    confirmAction(
      t('employees.revokePos'),
      t('employees.revokePosConfirm', { name: emp.fullName }),
      () => {
        revokePosAccess.mutate(employeeId, {
          onSuccess: () => Alert.alert(t('common.done'), t('employees.posRevoked')),
          onError: () => Alert.alert(t('common.error'), t('common.serverError')),
        });
      },
    );
  };

  const handleGrantPosAccess = () => {
    grantPosAccess.mutate(employeeId, {
      onSuccess: () => Alert.alert(t('common.done'), t('employees.posGranted')),
      onError: () => Alert.alert(t('common.error'), t('common.serverError')),
    });
  };

  const handleFire = () => {
    confirmAction(
      t('employees.fireTitle'),
      t('employees.fireConfirm', { name: emp.fullName }),
      () => {
        updateStatus.mutate(
          { id: employeeId, status: 'fired' },
          {
            onSuccess: () => Alert.alert(t('common.done'), t('employees.fired')),
            onError: () => Alert.alert(t('common.error'), t('common.serverError')),
          },
        );
      },
    );
  };

  const handleDelete = () => {
    confirmAction(
      t('employees.deleteTitle'),
      t('employees.deleteConfirm', { name: emp.fullName }),
      () => {
        deleteEmployee.mutate(employeeId, {
          onSuccess: () => {
            Alert.alert(t('common.done'), t('employees.deleted'));
            navigation.goBack();
          },
          onError: () => Alert.alert(t('common.error'), t('common.serverError')),
        });
      },
    );
  };

  if (profile.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <EmployeeDetailHeader
        employeeName={employeeName}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={profile.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
      >
        <EmployeeAvatarSection employee={emp} />

        <EmployeeBioCard employee={emp} />

        <EmployeeAccessCard employee={emp} />

        {perf && <EmployeePerformanceCard performance={perf} />}

        <EmployeeSuspiciousCard alerts={suspAlerts} />

        <EmployeeActionButtons
          employee={emp}
          employeeId={employeeId}
          onRevokePosAccess={handleRevokePosAccess}
          onGrantPosAccess={handleGrantPosAccess}
          onFire={handleFire}
          onDelete={handleDelete}
          isRevokePending={revokePosAccess.isPending}
          isGrantPending={grantPosAccess.isPending}
          isFirePending={updateStatus.isPending}
          isDeletePending={deleteEmployee.isPending}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});
