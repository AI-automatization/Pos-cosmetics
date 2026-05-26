import { StyleSheet } from 'react-native';
import { C } from './SmenaComponents';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerDate: { fontSize: 12, color: C.muted, marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statusPillActive: { backgroundColor: '#D1FAE5' },
  statusPillClosed: { backgroundColor: C.border },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  scroll: { paddingBottom: 120, gap: 16, paddingTop: 16 },

  // Active shift card
  shiftCard: {
    marginHorizontal: 16,
    backgroundColor: '#F0FDF4', borderRadius: 14,
    borderLeftWidth: 4, borderLeftColor: C.green,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  shiftCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shiftLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green },
  shiftCashier: { fontSize: 15, fontWeight: '700', color: C.text },
  shiftTime: { fontSize: 12, color: C.secondary, marginTop: 2 },
  shiftCashBox: { alignItems: 'flex-end' },
  shiftCashLabel: { fontSize: 11, color: C.muted },
  shiftCashValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 2 },

  // Stats grid (2x2)
  statsGrid: {
    marginHorizontal: 16,
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },

  // Detailed report
  reportCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    gap: 10,
  },
  reportTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 2 },
  reportDivider: { height: 1, backgroundColor: C.border },
  netRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  netLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  netValue: { fontSize: 18, fontWeight: '800', color: C.green },

  // No shift
  noShift: { alignItems: 'center', paddingVertical: 40, gap: 12, marginHorizontal: 16 },
  noShiftIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  noShiftTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  noShiftSub: { fontSize: 14, color: C.muted, textAlign: 'center' },

  // History
  historySection: { marginHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.text },

  // Footer button
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 34,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, height: 54, gap: 10,
  },
  toggleBtnOpen: {
    backgroundColor: C.green,
    shadowColor: C.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  toggleBtnClose: {
    backgroundColor: C.red,
    shadowColor: C.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  toggleBtnText: { fontSize: 16, fontWeight: '800', color: C.white },
});
