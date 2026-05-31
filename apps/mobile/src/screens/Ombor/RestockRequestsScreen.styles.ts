// RestockRequestsScreen — styles
import { StyleSheet } from 'react-native';

/** Screen-local color tokens (orange differs from OmborColors) */
export const RC = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  primary: '#2563EB',
  orange: '#F97316',
  green: '#16A34A',
  red: '#DC2626',
  subtleText: '#6B7280',
  orangeBg: '#FFF7ED',
  grayBg: '#F3F4F6',
} as const;

export const styles = StyleSheet.create({
  /* --- Layout --- */
  safe: { flex: 1, backgroundColor: RC.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: RC.white,
    borderBottomWidth: 1,
    borderBottomColor: RC.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: RC.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: RC.text },
  headerSub: { fontSize: 12, color: RC.muted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: RC.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* --- Filter tabs --- */
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: RC.white,
    borderBottomWidth: 1,
    borderBottomColor: RC.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: RC.grayBg,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: RC.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: RC.muted },
  tabTextActive: { color: RC.white },

  /* --- List --- */
  listContent: { padding: 16, paddingBottom: 40 },

  /* --- Card --- */
  card: {
    backgroundColor: RC.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RC.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: RC.orange,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RC.orange,
    zIndex: 1,
  },
  cardBody: { padding: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: RC.orangeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: RC.text },
  cardTime: { fontSize: 11, color: RC.muted, marginTop: 1 },
  stockBadge: { alignItems: 'center' },
  stockBadgeText: { fontSize: 18, fontWeight: '800', color: RC.red },
  stockBadgeLabel: { fontSize: 10, color: RC.muted },
  cardMessage: { fontSize: 13, color: RC.subtleText, lineHeight: 18 },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  branchText: { fontSize: 11, color: RC.muted },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: RC.green,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  acceptBtnDisabled: { opacity: 0.5 },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  readBadgeText: { fontSize: 12, color: RC.green, fontWeight: '600' },

  /* --- Empty state --- */
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: RC.muted },
  emptyDesc: { fontSize: 13, color: RC.muted, textAlign: 'center' },
});
