import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BranchItem {
  readonly branchId: string;
  readonly branchName: string;
  readonly revenue: number;
  readonly orders: number;
}

export interface BranchRevenueCardProps {
  readonly branches: BranchItem[];
  readonly loading?: boolean;
}

interface BranchRowProps {
  readonly branch: BranchItem;
  readonly maxRevenue: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  border:    '#E5E7EB',
  primary:   '#2563EB',
  primaryBg: '#EFF6FF',
  gray:      '#374151',
  trackBg:   '#F3F4F6',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M so'm";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K so'm";
  return n.toLocaleString('uz-UZ') + " so'm";
}

// ─── BranchRow ────────────────────────────────────────────────────────────────

function BranchRowComponent({ branch, maxRevenue }: BranchRowProps): React.ReactElement {
  const pct = maxRevenue > 0
    ? Math.min((branch.revenue / maxRevenue) * 100, 100)
    : 0;

  return (
    <View style={styles.branchRow}>
      <View style={styles.rowHeader}>
        <Text style={styles.branchName} numberOfLines={1}>
          {branch.branchName}
        </Text>
        <Text style={styles.revenueText}>{fmt(branch.revenue)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>

      <Text style={styles.ordersText}>{branch.orders} ta buyurtma</Text>
    </View>
  );
}

const BranchRow = React.memo(BranchRowComponent);

// ─── BranchRevenueCard ────────────────────────────────────────────────────────

function BranchRevenueCardComponent({
  branches,
  loading = false,
}: BranchRevenueCardProps): React.ReactElement {
  const maxRevenue = branches.length > 0
    ? Math.max(...branches.map((b) => b.revenue))
    : 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filiallar daromadi</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>30 kun</Text>
          </View>
        </View>
        {loading && (
          <ActivityIndicator
            size="small"
            color={C.primary}
            style={styles.loader}
          />
        )}
      </View>

      {/* Empty state */}
      {!loading && branches.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Filial ma'lumotlari yo'q</Text>
        </View>
      )}

      {/* Branch list */}
      {!loading && branches.length > 0 && (
        <View style={styles.body}>
          {branches.map((branch) => (
            <BranchRow
              key={branch.branchId}
              branch={branch}
              maxRevenue={maxRevenue}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default React.memo(BranchRevenueCardComponent);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  badge: {
    backgroundColor: C.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },
  loader: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: C.muted,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  branchRow: {
    marginBottom: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  branchName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: C.gray,
    marginRight: 8,
  },
  revenueText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: C.trackBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  ordersText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },
});
