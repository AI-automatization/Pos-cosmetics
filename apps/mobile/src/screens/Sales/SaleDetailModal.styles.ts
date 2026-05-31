import { StyleSheet, Platform } from 'react-native';
import { C } from './SalesColors';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  // ─── Header ───────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    letterSpacing: 0.5,
  },
  orderTime: {
    fontSize: 13,
    color: C.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── Info card ────────────────────────────────────────────────
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  methodPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  methodPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Items ────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  itemsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flex: 1,
    gap: 3,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  itemMeta: {
    fontSize: 12,
    color: C.muted,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },

  // ─── Summary ──────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: C.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },

  // ─── Actions ──────────────────────────────────────────────────
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnReturn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    height: 50,
  },
  btnReturnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnPrint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    height: 50,
  },
  btnPrintText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnClose: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default styles;
