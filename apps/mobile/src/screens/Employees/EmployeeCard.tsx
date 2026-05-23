import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmployeePerformance } from '../../api/employees.api';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors, Radii } from '../../config/theme';

interface EmployeeCardProps {
  item: EmployeePerformance;
  onPress?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = ['#1E40AF', '#0891B2', '#16A34A', '#7C3AED', '#D97706', '#DC2626'];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? Colors.primary;
}

export default function EmployeeCard({ item, onPress }: EmployeeCardProps) {
  const { t } = useTranslation();
  const bg = avatarColor(item.employeeName);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: bg }]}>
              <Text style={styles.avatarText}>{getInitials(item.employeeName)}</Text>
            </View>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{item.employeeName}</Text>
              <Text style={styles.role}>{item.role} · {item.branchName}</Text>
            </View>
          </View>
          <View style={styles.badges}>
            {item.suspiciousActivityCount > 0 && (
              <Badge label={`⚠ ${item.suspiciousActivityCount}`} variant="warning" />
            )}
            {onPress && (
              <Text style={styles.chevron}>›</Text>
            )}
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('employees.orders')}</Text>
            <Text style={styles.statValue}>{item.totalOrders}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('employees.revenue')}</Text>
            <Text style={styles.statValue}>{formatCurrency(item.totalRevenue)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('employees.refunds')}</Text>
            <Text style={[styles.statValue, item.refundRate > 5 && styles.warnText]}>
              {item.totalRefunds} ({item.refundRate.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('employees.voids')}</Text>
            <Text style={[styles.statValue, item.totalVoids > 0 && styles.warnText]}>
              {item.totalVoids}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  nameBlock: { flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.textWhite },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  role: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chevron: { fontSize: 22, color: Colors.textMuted, lineHeight: 24 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { width: '47%' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  warnText: { color: Colors.danger },
});
