import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:       '#F9FAFB',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  border:   '#E5E7EB',
  primary:  '#2563EB',
  red:      '#DC2626',
  redBg:    '#FEF2F2',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  avatarBg: '#EFF6FF',
};

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  headerPlaceholder: { width: 36 },

  loader: { marginTop: 40 },
  content: { paddingBottom: 48 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroAvatarText: { fontSize: 26, fontWeight: '800', color: C.primary },
  heroName: { fontSize: 20, fontWeight: '800', color: C.text },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeActive: { backgroundColor: C.greenBg },
  statusBadgeInactive: { backgroundColor: C.redBg },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  statusBadgeTextActive: { color: C.green },
  statusBadgeTextInactive: { color: C.red },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  // Info card
  card: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 48,
  },

  // Notes
  notesWrap: { paddingVertical: 14 },
  notesText: { fontSize: 14, color: C.text, lineHeight: 22 },

  // Active debts section
  debtsWrap: {
    marginHorizontal: 16,
  },
  emptyDebtsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: C.greenBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyDebtsText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.green,
  },

  // Progress bar
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
