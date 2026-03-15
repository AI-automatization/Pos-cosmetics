import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { Employee, EmployeeStatus } from '../../api/employees.api';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

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
  emergencyContactName: "Kamola Qodirova (singlisi)",
  emergencyContactPhone: '+998 91 234 56 78',
};

// ─── Helper components ────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const config: Record<EmployeeStatus, { label: string; color: string; bg: string }> = {
    active:   { label: '● FAOL',            color: Colors.success, bg: Colors.successLight },
    inactive: { label: '● NOFAOL',          color: Colors.warning, bg: Colors.warningLight },
    fired:    { label: '● ISHDAN CHIQARILGAN', color: Colors.danger,  bg: Colors.dangerLight },
  };
  const c = config[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

function AccessRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <View style={styles.accessRow}>
      <Ionicons
        name={granted ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={granted ? Colors.success : Colors.textMuted}
      />
      <Text style={[styles.accessLabel, !granted && styles.accessLabelOff]}>{label}</Text>
    </View>
  );
}

function StatBox({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, warn && styles.statWarn]}>{value}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

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

  const isLoading = profile.isLoading;

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isFired = emp.status === 'fired';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{employeeName}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={profile.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
      >
        {/* Avatar + status */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
            <Text style={styles.avatarText}>
              {emp.firstName[0]?.toUpperCase()}{emp.lastName[0]?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.fullName}>{emp.fullName}</Text>
          <Text style={styles.roleText}>{emp.role} · {emp.branchName}</Text>
          <StatusBadge status={emp.status} />
        </View>

        {/* Bio */}
        <Card style={styles.card}>
          <SectionTitle title={t('employees.bio')} />
          <InfoRow icon="📞" label={t('employees.phone')} value={emp.phone} />
          <InfoRow icon="📧" label={t('employees.email')} value={emp.email} />
          <InfoRow icon="🎂" label={t('employees.dob')} value={emp.dateOfBirth} />
          <InfoRow icon="🪪" label={t('employees.passport')} value={emp.passportId} />
          <InfoRow icon="🏠" label={t('employees.address')} value={emp.address} />
          <InfoRow icon="📅" label={t('employees.hireDate')} value={emp.hireDate} />
          <InfoRow icon="🏢" label={t('employees.branch')} value={emp.branchName} />
          {emp.emergencyContactName && (
            <>
              <View style={styles.separator} />
              <Text style={styles.emergencyTitle}>{t('employees.emergencyContact')}</Text>
              <InfoRow icon="👤" label={t('employees.contactName')} value={emp.emergencyContactName} />
              <InfoRow icon="📞" label={t('employees.contactPhone')} value={emp.emergencyContactPhone} />
            </>
          )}
        </Card>

        {/* Login / access */}
        <Card style={styles.card}>
          <SectionTitle title={t('employees.accessInfo')} />
          <InfoRow icon="👤" label={t('employees.login')} value={emp.login} />
          <View style={styles.accessList}>
            <AccessRow label={t('employees.posAccess')} granted={emp.hasPosAccess} />
            <AccessRow label={t('employees.adminAccess')} granted={emp.hasAdminAccess} />
            <AccessRow label={t('employees.reportsAccess')} granted={emp.hasReportsAccess} />
          </View>
        </Card>

        {/* Performance */}
        {perf && (
          <Card style={styles.card}>
            <SectionTitle title={t('employees.performance')} />
            <View style={styles.statsGrid}>
              <StatBox label={t('employees.orders')} value={String(perf.totalOrders)} />
              <StatBox label={t('employees.revenue')} value={formatCurrency(perf.totalRevenue)} />
              <StatBox
                label={t('employees.refunds')}
                value={`${perf.totalRefunds} (${perf.refundRate.toFixed(1)}%)`}
                warn={perf.refundRate > 5}
              />
              <StatBox
                label={t('employees.voids')}
                value={String(perf.totalVoids)}
                warn={perf.totalVoids > 0}
              />
              <StatBox label={t('employees.avgOrder')} value={formatCurrency(perf.avgOrderValue)} />
              <StatBox
                label={t('employees.discounts')}
                value={`${perf.totalDiscounts} (${perf.discountRate.toFixed(1)}%)`}
                warn={perf.discountRate > 20}
              />
            </View>
          </Card>
        )}

        {/* Suspicious activity alerts */}
        {suspAlerts.length > 0 && (
          <Card style={StyleSheet.flatten([styles.card, styles.cardWarn])}>
            <SectionTitle title={`⚠️ ${t('employees.suspiciousActivity')} (${suspAlerts.length})`} />
            {suspAlerts.map((a) => (
              <View key={a.id} style={styles.alertRow}>
                <View style={[styles.alertDot, styles[`dot_${a.severity}`]]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertDesc}>{a.description}</Text>
                  <Text style={styles.alertMeta}>
                    {t(`employees.${a.type}`)} · {new Date(a.occurredAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* POS access toggle */}
          {emp.hasPosAccess ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnWarn]}
              onPress={handleRevokePosAccess}
              disabled={revokePosAccess.isPending}
            >
              <Ionicons name="phone-portrait-outline" size={18} color={Colors.warning} />
              <Text style={[styles.actionBtnText, { color: Colors.warning }]}>
                {t('employees.revokePos')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSuccess]}
              onPress={handleGrantPosAccess}
              disabled={grantPosAccess.isPending}
            >
              <Ionicons name="phone-portrait-outline" size={18} color={Colors.success} />
              <Text style={[styles.actionBtnText, { color: Colors.success }]}>
                {t('employees.grantPos')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Fire */}
          {!isFired && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={handleFire}
              disabled={updateStatus.isPending}
            >
              <Ionicons name="ban-outline" size={18} color={Colors.danger} />
              <Text style={[styles.actionBtnText, { color: Colors.danger }]}>
                {t('employees.fireTitle')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={handleDelete}
            disabled={deleteEmployee.isPending}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.textWhite} />
            <Text style={[styles.actionBtnText, { color: Colors.textWhite }]}>
              {t('employees.deleteTitle')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
    paddingTop: 52,
  },
  backBtn: { width: 38, alignItems: 'flex-start' },
  headerTitle: { flex: 1, ...Typography.h4, color: Colors.primary, textAlign: 'center' },
  scroll: { flex: 1 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: Colors.textWhite },
  fullName: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 2 },
  roleText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  card: { marginHorizontal: 16, marginTop: 12 },
  cardWarn: { borderLeftWidth: 3, borderLeftColor: Colors.warning },

  sectionTitle: {
    ...Typography.captionMedium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10,
  },
  infoIcon: { fontSize: 16, width: 22, textAlign: 'center', marginTop: 1 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  separator: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4,
  },

  accessList: { gap: 8, marginTop: 4 },
  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accessLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  accessLabelOff: { color: Colors.textMuted },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '47%',
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.md,
    padding: 10,
  },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  statWarn: { color: Colors.danger },

  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  dot_high: { backgroundColor: Colors.danger },
  dot_medium: { backgroundColor: Colors.warning },
  dot_low: { backgroundColor: Colors.info },
  alertContent: { flex: 1 },
  alertDesc: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  alertMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

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
  actionBtnText: { fontSize: 14, fontWeight: '700' },
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
