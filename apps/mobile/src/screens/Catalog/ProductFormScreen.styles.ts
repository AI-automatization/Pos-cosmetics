import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
};

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  flex1: { flex: 1 },
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#2563EB', borderRadius: 10,
    minWidth: 72, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#E5E7EB' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 40, gap: 8 },
  imagePicker: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center', paddingVertical: 24, gap: 6,
    marginBottom: 4,
  },
  imageCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  imageLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  imageHint: { fontSize: 12, color: C.muted },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginTop: 8, marginBottom: 6,
  },
  card: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  field: { paddingVertical: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginBottom: 6 },
  required: { color: C.red },
  fieldDivider: { height: 1, backgroundColor: '#F3F4F6' },
  input: {
    height: 44, backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, fontSize: 15, color: C.text,
  },
  inputReadOnly: { backgroundColor: '#F3F4F6', color: C.muted },
  inputMultiline: { height: 80, paddingTop: 10 },
  selectRow: {
    height: 44, backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  selectText: { fontSize: 15, color: C.text },
  selectPlaceholder: { color: C.muted },
  priceRow: { flexDirection: 'row', gap: 12 },
  marginRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 4, paddingBottom: 12,
  },
  marginLabel: { fontSize: 13, color: C.muted, fontWeight: '500' },
  marginBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  marginText: { fontSize: 13, fontWeight: '800' },
  marginHint: { fontSize: 12, color: C.muted },
  barcodeRow: { flexDirection: 'row', gap: 8 },
  scanBtn: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: C.text },
  toggleHint: { fontSize: 12, color: C.muted, marginTop: 2 },
  bottomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2563EB',
    borderRadius: 14, height: 54, marginTop: 8,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  bottomBtnDisabled: {
    backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0,
  },
  bottomBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 4 },
});
