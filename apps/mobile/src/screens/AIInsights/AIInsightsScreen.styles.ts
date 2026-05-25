import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

export const styles = StyleSheet.create({
  // Screen header
  screenHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.sm,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenHeaderTitle: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.xs,
    marginBottom:   4,
  },
  screenHeaderText: {
    fontSize:   24,
    fontWeight: '700',
    color:      colors.textPrimary,
  },
  screenHeaderSubtitle: {
    fontSize: 13,
    color:    colors.textSecond,
  },

  // Period selector
  periodRow: {
    flexDirection:     'row',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.sm,
    gap:               spacing.sm,
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      borderRadius.full,
    backgroundColor:   colors.surfaceLow,
    minHeight:         34,
    justifyContent:    'center',
  },
  periodPillActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize:   13,
    fontWeight: '600',
    color:      colors.textSecond,
  },
  periodTextActive: {
    color: colors.surface,
  },

  // Filter chips
  filterRow: {
    flexDirection:     'row',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.xs,
    gap:               spacing.sm,
  },
  filterChip: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:      borderRadius.full,
    backgroundColor:   colors.surfaceLow,
    minHeight:         34,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontSize:   12,
    fontWeight: '600',
    color:      colors.textSecond,
  },
  filterTextActive: {
    color: colors.surface,
  },

  // Summary row
  summaryRow: {
    flexDirection:     'row',
    gap:               spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.xs,
  },
  summaryPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      borderRadius.full,
    backgroundColor:   colors.surfaceLow,
  },
  summaryPillCritical: {
    backgroundColor: '#FEE2E2',
  },
  summaryText: {
    fontSize:   12,
    fontWeight: '500',
    color:      colors.textSecond,
  },
  summaryTextCritical: {
    color: colors.danger,
  },

  // List
  list: {
    padding:    spacing.lg,
    paddingTop: spacing.md,
    flexGrow:   1,
  },
  separator: {
    height: spacing.sm,
  },
});
