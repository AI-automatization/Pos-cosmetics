import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:         '#F9FAFB',
  white:      '#FFFFFF',
  text:       '#111827',
  muted:      '#9CA3AF',
  border:     '#E5E7EB',
  primary:    '#2563EB',
  primaryBg:  '#EFF6FF',
  orange:     '#EA580C',
  orangeBg:   '#FFF7ED',
  orangeBorder:'#FED7AA',
  green:      '#16A34A',
  greenBg:    '#F0FDF4',
  red:        '#DC2626',
  inputBorder:'#D1D5DB',
  inputFocus: '#2563EB',
  disabled:   '#93C5FD',
} as const;

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  // Modal overlay
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // Bottom sheet
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },

  // Debt info block
  debtInfoBlock: {
    backgroundColor: C.orangeBg,
    borderWidth: 1,
    borderColor: C.orangeBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  debtInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  debtInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.orange,
  },
  debtInfoAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: C.orange,
  },
  debtInfoOrder: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  // Field label
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 6,
  },

  // Text input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: C.inputFocus,
    backgroundColor: C.white,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  inputSuffix: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },

  // Quick buttons
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  quickBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },

  // Payment method
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  methodBtnActive: {
    backgroundColor: C.primaryBg,
    borderColor: C.primary,
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  methodBtnTextActive: {
    color: C.primary,
  },

  // Submit button
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 20,
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: C.disabled,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
