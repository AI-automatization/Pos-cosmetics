import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  debtSummary: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  debtSummaryItem: {
    alignItems: 'flex-start',
  },
  debtTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
  },
  debtTotalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  debtOverdue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f97316',
  },
  debtOverdueLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactPhone: {
    fontSize: 14,
    color: '#374151',
  },
  dueDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#1a56db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  methodChipActive: {
    backgroundColor: '#1a56db',
    borderColor: '#1a56db',
  },
  methodChipText: {
    fontSize: 13,
    color: '#374151',
  },
  methodChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  paymentNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
