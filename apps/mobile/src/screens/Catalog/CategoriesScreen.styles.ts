import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  red:     '#DC2626',
};

// ─── Sheet styles ───────────────────────────────────────
export const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 8,
  },
  input: {
    height: 50, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, fontSize: 15, color: C.text,
    marginBottom: 16,
  },
  selectRow: {
    height: 50, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, marginBottom: 20,
  },
  selectText: { flex: 1, fontSize: 15, color: C.text },
  selectPlaceholder: { color: C.muted },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Screen styles ──────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerCount: { fontSize: 12, color: C.muted, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  loader: { flex: 1 },
  listContent: { paddingVertical: 8, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 64 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, gap: 12,
  },
  rowChild: { paddingLeft: 32, backgroundColor: C.bg },
  indentLine: {
    position: 'absolute', left: 28, top: 0, bottom: 0,
    width: 1.5, backgroundColor: C.border,
  },
  folderIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
  },
  folderIconChild: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  catName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  countBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: '#EFF6FF', borderRadius: 20,
  },
  countText: { fontSize: 12, fontWeight: '700', color: C.primary },
  menuBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.primary, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
