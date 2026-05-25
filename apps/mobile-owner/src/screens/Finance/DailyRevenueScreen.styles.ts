import { StyleSheet } from 'react-native';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.primary,
    flex: 1,
  },
  headerSpacer: { width: 34 },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* Period selector */
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.textWhite,
  },

  /* Summary cards */
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    ...Shadows.card,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  /* Section title */
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  /* Day cards */
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 14,
    ...Shadows.card,
  },
  dayCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  dayLeft: {
    flex: 1,
    gap: 4,
  },
  dayDate: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayRevenue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dayRevenueHigh: {
    color: Colors.success,
  },
  separator: { height: 8 },

  /* Empty */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
