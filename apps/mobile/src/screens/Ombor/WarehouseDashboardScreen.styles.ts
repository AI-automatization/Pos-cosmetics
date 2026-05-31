// WarehouseDashboardScreen — styles
import { StyleSheet } from 'react-native';
import { C } from './OmborColors';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats 2x2
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },

  // Quick Nav Chips
  chipScroll: { marginTop: 16 },
  chipRow: { paddingHorizontal: 16, gap: 8 },

  // Alert Banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 10,
  },
  alertBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.red },

  // Section
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 },
  countBadgeRed: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    marginBottom: 8,
  },
  countBadgeRedText: { fontSize: 11, fontWeight: '700', color: C.red },
  countBadgeBlue: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    marginBottom: 8,
  },
  countBadgeBlueText: { fontSize: 11, fontWeight: '700', color: C.primary },

  // Low Stock
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  lowStockName: { flex: 1, fontSize: 13, fontWeight: '600', color: C.text, marginRight: 8 },
  lowStockQty: { fontSize: 13, fontWeight: '700' },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  seeAllText: { fontSize: 13, fontWeight: '600', color: C.primary },

  // Expiry cards
  expiryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  expiryLeftBorder: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: C.orange,
  },
  expiryContent: { flex: 1, padding: 12, gap: 2 },
  expiryName: { fontSize: 13, fontWeight: '600', color: C.text },
  expiryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expiryDateText: { fontSize: 11, color: C.orange, fontWeight: '600' },
  expiryBatch: { fontSize: 11, color: C.muted },
  expiryQty: { fontSize: 13, fontWeight: '700', color: C.text, paddingRight: 12 },
});
