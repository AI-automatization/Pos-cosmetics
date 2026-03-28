// OmborRequestSheet — Bottom sheet for sending a warehouse restock request.
// Shows low/out-of-stock items with checkboxes and qty controls.
// Barcode scanner highlights matching product row for 1500ms.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { LowStockItem } from '../../api/inventory.api';
import CameraSection from '../Scanner/CameraSection';

// ─── Colors ────────────────────────────────────────────
const C = {
  primary:   '#5B5BD6',
  green:     '#10B981',
  orange:    '#F59E0B',
  red:       '#EF4444',
  white:     '#FFFFFF',
  bg:        '#F9FAFB',
  text:      '#111827',
  secondary: '#6B7280',
  muted:     '#9CA3AF',
  border:    '#F3F4F6',
  label:     '#374151',
};

// ─── Types ──────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  items: LowStockItem[];
}

type StockStatus = 'KAM' | 'TUGADI' | 'NORMAL';

interface RequestItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  minStockLevel: number;
  checked: boolean;
  qty: number;
}

// ─── Helpers ────────────────────────────────────────────
function getStatus(item: { stock: number; minStockLevel: number }): StockStatus {
  if (item.stock === 0) return 'TUGADI';
  if (item.stock <= item.minStockLevel) return 'KAM';
  return 'NORMAL';
}

function buildRequestItems(items: LowStockItem[]): RequestItem[] {
  return items.map((item) => {
    const status = getStatus(item);
    const isActive = status === 'TUGADI' || status === 'KAM';
    const qty = isActive ? Math.max(1, item.minStockLevel - item.stock) : 0;
    return {
      productId:     item.productId,
      productName:   item.productName,
      warehouseId:   item.warehouseId,
      warehouseName: item.warehouseName,
      stock:         item.stock,
      minStockLevel: item.minStockLevel,
      checked:       isActive,
      qty,
    };
  });
}

// ─── Status badge config ────────────────────────────────
const STATUS_CFG: Record<StockStatus, { bg: string; text: string; label: string }> = {
  KAM:    { bg: '#FEF3C7', text: C.orange, label: 'KAM'    },
  TUGADI: { bg: '#FEE2E2', text: C.red,    label: 'TUGADI' },
  NORMAL: { bg: '#D1FAE5', text: C.green,  label: 'NORMAL' },
};

// ─── Component ─────────────────────────────────────────
export default function OmborRequestSheet({ visible, onClose, items }: Props) {
  const [requestItems, setRequestItems]   = useState<RequestItem[]>([]);
  const [search, setSearch]               = useState('');
  const [cameraOpen, setCameraOpen]       = useState(false);
  const [isScanActive, setIsScanActive]   = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Re-initialise items each time sheet opens
  React.useEffect(() => {
    if (visible) {
      setRequestItems(buildRequestItems(items));
      setSearch('');
      setHighlightedId(null);
    }
  }, [visible, items]);

  // ─── Summary counts ──────────────────────────────────
  const { kamCount, tugadiCount } = useMemo(() => {
    const kam    = items.filter((i) => getStatus(i) === 'KAM').length;
    const tugadi = items.filter((i) => getStatus(i) === 'TUGADI').length;
    return { kamCount: kam, tugadiCount: tugadi };
  }, [items]);

  const total = items.length;

  // ─── Filtered list ───────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return requestItems;
    return requestItems.filter((item) =>
      item.productName.toLowerCase().includes(q),
    );
  }, [search, requestItems]);

  // ─── Toggle checkbox ─────────────────────────────────
  const handleToggle = (productId: string) => {
    setRequestItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              checked: !item.checked,
              qty: !item.checked
                ? Math.max(1, item.minStockLevel - item.stock)
                : 0,
            }
          : item,
      ),
    );
  };

  // ─── Quantity change ─────────────────────────────────
  const handleQtyChange = (productId: string, delta: number) => {
    setRequestItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      ),
    );
  };

  // ─── Scanner callback ────────────────────────────────
  const handleScanned = ({ data: barcode }: { data: string }) => {
    setIsScanActive(false);
    setCameraOpen(false);
    const lower = barcode.toLowerCase();
    const match = requestItems.find((item) =>
      item.productName.toLowerCase().includes(lower) ||
      item.productId === barcode,
    );
    if (match) {
      setHighlightedId(match.productId);
      setTimeout(() => setHighlightedId(null), 1500);
    }
    setIsScanActive(true);
  };

  // ─── Submit ──────────────────────────────────────────
  const handleSubmit = () => {
    // API integration is a separate task — just close for now.
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Omborga so'rovi</Text>

            <TouchableOpacity
              style={styles.scanHeaderBtn}
              onPress={() => { setIsScanActive(true); setCameraOpen(true); }}
              activeOpacity={0.75}
            >
              <Ionicons name="barcode-outline" size={20} color={C.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={18} color={C.secondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Kam yoki tugagan mahsulotlar ro'yxati
          </Text>

          {/* Summary chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {/* Total chip */}
            <View style={styles.chipTotal}>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={14}
                color={C.primary}
              />
              <Text style={styles.chipTotalText}>{total} ta mahsulot</Text>
            </View>

            {/* Kam chip */}
            <View style={styles.chipKam}>
              <Ionicons name="warning-outline" size={14} color={C.orange} />
              <Text style={styles.chipKamText}>{kamCount} ta kam</Text>
            </View>

            {/* Tugadi chip */}
            <View style={styles.chipTugadi}>
              <Ionicons name="alert-circle-outline" size={14} color={C.red} />
              <Text style={styles.chipTugadiText}>{tugadiCount} ta tugadi</Text>
            </View>
          </ScrollView>

          {/* Search row */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Mahsulot qidirish..."
              placeholderTextColor={C.muted}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity
              style={styles.searchScanBtn}
              onPress={() => { setIsScanActive(true); setCameraOpen(true); }}
              activeOpacity={0.75}
            >
              <Ionicons name="barcode-outline" size={18} color={C.secondary} />
            </TouchableOpacity>
          </View>

          {/* Product list */}
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filtered.map((item) => {
              const status  = getStatus(item);
              const cfg     = STATUS_CFG[status];
              const isActive = item.checked;
              const isHighlighted = highlightedId === item.productId;

              return (
                <View
                  key={`${item.productId}-${item.warehouseId}`}
                  style={[
                    styles.row,
                    isActive   ? styles.rowChecked   : styles.rowUnchecked,
                    isHighlighted && styles.rowHighlight,
                  ]}
                >
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      isActive ? styles.checkboxChecked : styles.checkboxUnchecked,
                    ]}
                    onPress={() => handleToggle(item.productId)}
                    activeOpacity={0.75}
                  >
                    {isActive && (
                      <Ionicons name="checkmark" size={14} color={C.white} />
                    )}
                  </TouchableOpacity>

                  {/* Content */}
                  <View style={styles.rowContent}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <View style={styles.rowMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: cfg.text }]}>
                          {cfg.label}
                        </Text>
                      </View>
                      <Text style={styles.stockText}>Qoldiq: {item.stock} ta</Text>
                    </View>
                  </View>

                  {/* Quantity control */}
                  <View style={[styles.qtyRow, !isActive && styles.qtyRowDisabled]}>
                    <TouchableOpacity
                      style={styles.qtyBtnMinus}
                      onPress={() => handleQtyChange(item.productId, -1)}
                      disabled={!isActive}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="remove" size={16} color={C.label} />
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.qty}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtnPlus}
                      onPress={() => handleQtyChange(item.productId, 1)}
                      disabled={!isActive}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="add" size={16} color={C.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Action buttons row */}
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelBtnText}>Bekor qilish</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={16} color={C.white} />
                <Text style={styles.submitBtnText}>Yuborish</Text>
              </TouchableOpacity>
            </View>

            {/* Telegram hint */}
            <View style={styles.footerHint}>
              <Ionicons name="flash-outline" size={12} color={C.muted} />
              <Text style={styles.footerHintText}>
                So'rov omborchiga Telegram orqali yuboriladi
              </Text>
            </View>
          </View>
        </View>

        {/* Camera overlay — same Modal, avoids iOS nested-modal issue */}
        {cameraOpen && (
          <View style={styles.cameraOverlay}>
            <CameraSection
              isScanActive={isScanActive}
              onActivate={() => setIsScanActive(true)}
              onBarcodeScanned={handleScanned}
            />
            <TouchableOpacity
              style={styles.cameraCloseBtn}
              onPress={() => { setCameraOpen(false); setIsScanActive(true); }}
            >
              <Text style={styles.cameraCloseBtnText}>Yopish</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  // Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 34,
  },

  // Drag handle
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  scanHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Subtitle
  subtitle: {
    fontSize: 13,
    color: C.muted,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // Summary chips
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  chipTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  chipTotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  chipKam: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
  },
  chipKamText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.orange,
  },
  chipTugadi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  chipTugadiText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },

  // Search row
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  searchScanBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Product list scroll
  listScroll: {
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // Product row
  row: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowChecked: {
    backgroundColor: C.white,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rowUnchecked: {
    backgroundColor: C.bg,
    opacity: 0.6,
  },
  rowHighlight: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },

  // Checkbox
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.primary,
  },
  checkboxUnchecked: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },

  // Row content
  rowContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockText: {
    fontSize: 11,
    color: C.muted,
  },

  // Quantity control
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyRowDisabled: {
    opacity: 0.4,
  },
  qtyBtnMinus: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  qtyBtnPlus: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.label,
  },
  submitBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },

  // Camera overlay (inside Modal — avoids iOS nested-modal issue)
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 100,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  cameraCloseBtn: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cameraCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  // Telegram hint
  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  footerHintText: {
    fontSize: 11,
    color: C.muted,
  },
});
