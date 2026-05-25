import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftReport } from '../../api/shifts.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, formatDuration } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import { Colors, Radii } from '../../config/theme';
import { discrepancyColor, discrepancyLabel } from './shift-report.utils';

const ShiftCard = React.memo(function ShiftCard({ item }: { readonly item: ShiftReport }) {
  const isOpen = item.status === 'open';

  return (
    <View style={styles.card}>
      {/* Header: cashier + status */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cashierName} numberOfLines={1}>{item.cashierName}</Text>
            <Text style={styles.branchName}>{item.branchName}</Text>
          </View>
        </View>
        <Badge
          label={isOpen ? 'OCHIQ' : 'YOPIQ'}
          variant={isOpen ? 'success' : 'neutral'}
        />
      </View>

      {/* Time row */}
      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.timeText}>
            {formatDateTime(item.openedAt)}
            {item.closedAt ? ` — ${formatDateTime(item.closedAt)}` : ''}
          </Text>
        </View>
        {item.closedAt && (
          <Text style={styles.durationText}>
            {formatDuration(item.openedAt, item.closedAt)}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Revenue breakdown */}
      <View style={styles.revenueSection}>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Jami tushum</Text>
          <Text style={styles.revenueTotal}>{formatCurrency(item.totalRevenue)}</Text>
        </View>
        <View style={styles.revenueRow}>
          <View style={styles.revenueDot}>
            <View style={[styles.dot, { backgroundColor: Colors.success }]} />
            <Text style={styles.revenueSub}>Naqd</Text>
          </View>
          <Text style={styles.revenueSubValue}>{formatCurrency(item.cashRevenue)}</Text>
        </View>
        <View style={styles.revenueRow}>
          <View style={styles.revenueDot}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.revenueSub}>Karta</Text>
          </View>
          <Text style={styles.revenueSubValue}>{formatCurrency(item.cardRevenue)}</Text>
        </View>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueSub}>Buyurtmalar</Text>
          <Text style={styles.revenueSubValue}>{item.totalOrders} ta</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Cash reconciliation */}
      <View style={styles.reconciliation}>
        <View style={styles.reconciliationHeader}>
          <Ionicons name="cash-outline" size={16} color={Colors.primary} />
          <Text style={styles.reconciliationTitle}>Kassa solishtirma</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>Boshlang'ich naqd</Text>
          <Text style={styles.reconValue}>{formatCurrency(item.openingCash)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>Kutilgan naqd</Text>
          <Text style={styles.reconValue}>{formatCurrency(item.expectedCash)}</Text>
        </View>
        <View style={styles.reconRow}>
          <Text style={styles.reconLabel}>Yopilish naqdi</Text>
          <Text style={styles.reconValue}>
            {item.closingCash !== null ? formatCurrency(item.closingCash) : '---'}
          </Text>
        </View>
        <View style={styles.reconDivider} />
        <View style={styles.reconRow}>
          <Text style={styles.reconLabelBold}>Farq</Text>
          <Text style={[styles.reconValueBold, { color: discrepancyColor(item.discrepancy) }]}>
            {discrepancyLabel(item.discrepancy)}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default ShiftCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardHeaderInfo: { flex: 1 },
  cashierName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  branchName: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  timeText: { fontSize: 12, color: Colors.textMuted },
  durationText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border },
  revenueSection: { padding: 14, gap: 6 },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  revenueTotal: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  revenueDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  revenueSub: { fontSize: 13, color: Colors.textMuted },
  revenueSubValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  reconciliation: {
    padding: 14,
    backgroundColor: Colors.bgSubtle,
    gap: 6,
  },
  reconciliationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reconciliationTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  reconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reconLabel: { fontSize: 12, color: Colors.textMuted },
  reconValue: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  reconDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  reconLabelBold: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  reconValueBold: { fontSize: 14, fontWeight: '800' },
});
