import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:        '#F5F5F7',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#F3F4F6',
  primary:   '#5B5BD6',
  red:       '#EF4444',
  label:     '#374151',
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.secondary,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  productsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
  },
  productsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  productRow: {
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  productDetail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
