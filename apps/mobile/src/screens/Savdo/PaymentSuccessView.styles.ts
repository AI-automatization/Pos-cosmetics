import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 16,
    textAlign: 'center',
  },
  total: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loyaltyInfo: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  loyaltyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  loyaltyEarn: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  loyaltyBalance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  printRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
  },
  pdfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
  },
  smsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
  },
  printBtnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  printError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
    textAlign: 'center',
  },
  countdown: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 20,
  },
});

export default styles;
