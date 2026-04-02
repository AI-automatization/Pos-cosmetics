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
import { Ionicons } from '@expo/vector-icons';
import type { LowStockItem } from '../../api/inventory.api';

import { C, getStatus, buildRequestItems } from './components/types';
import type { RequestItem } from './components/types';
import SummaryChips from './components/SummaryChips';
import RequestProductRow from './components/RequestProductRow';
import RequestFooter from './components/RequestFooter';
import OmborCameraOverlay from './components/OmborCameraOverlay';

// ─── Types ──────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  items: LowStockItem[];
}

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
  const { kamCount, tugadiCount } = useMemo(() => ({
    kamCount:    items.filter((i) => getStatus(i) === 'KAM').length,
    tugadiCount: items.filter((i) => getStatus(i) === 'TUGADI').length,
  }), [items]);

  const total = items.length;

  // ─── Filtered list ───────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return requestItems;
    return requestItems.filter((item) =>
      item.productName.toLowerCase().includes(q),
    );
  }, [search, requestItems]);

  // ─── Handlers ────────────────────────────────────────
  const handleToggle = (productId: string) => {
    setRequestItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              checked: !item.checked,
              qty: !item.checked ? Math.max(1, item.minStockLevel - item.stock) : 0,
            }
          : item,
      ),
    );
  };

  const handleQtyChange = (productId: string, delta: number) => {
    setRequestItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      ),
    );
  };

  const handleScanned = ({ data: barcode }: { data: string }) => {
    setIsScanActive(false);
    setCameraOpen(false);
    const lower = barcode.toLowerCase();
    const match = requestItems.find(
      (item) => item.productName.toLowerCase().includes(lower) || item.productId === barcode,
    );
    if (match) {
      setHighlightedId(match.productId);
      setTimeout(() => setHighlightedId(null), 1500);
    }
    setIsScanActive(true);
  };

  const handleSubmit = () => {
    // API integration is a separate task — just close for now.
    onClose();
  };

  const openCamera = () => { setIsScanActive(true); setCameraOpen(true); };

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
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Omborga so'rovi</Text>
            <TouchableOpacity style={styles.scanHeaderBtn} onPress={openCamera} activeOpacity={0.75}>
              <Ionicons name="barcode-outline" size={20} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.75}>
              <Ionicons name="close" size={18} color={C.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Kam yoki tugagan mahsulotlar ro'yxati</Text>

          {/* Summary chips */}
          <SummaryChips total={total} kamCount={kamCount} tugadiCount={tugadiCount} />

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Mahsulot qidirish..."
              placeholderTextColor={C.muted}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.searchScanBtn} onPress={openCamera} activeOpacity={0.75}>
              <Ionicons name="barcode-outline" size={18} color={C.secondary} />
            </TouchableOpacity>
          </View>

          {/* Product list */}
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filtered.map((item) => (
              <RequestProductRow
                key={`${item.productId}-${item.warehouseId}`}
                item={item}
                isHighlighted={highlightedId === item.productId}
                onToggle={handleToggle}
                onQtyChange={handleQtyChange}
              />
            ))}
          </ScrollView>

          <RequestFooter onCancel={onClose} onSubmit={handleSubmit} />
        </View>

        {/* Camera overlay — inside Modal, avoids iOS nested-modal issue */}
        {cameraOpen && (
          <OmborCameraOverlay
            isScanActive={isScanActive}
            onActivate={() => setIsScanActive(true)}
            onBarcodeScanned={handleScanned}
            onClose={() => { setCameraOpen(false); setIsScanActive(true); }}
          />
        )}
      </Modal>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
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
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
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
  subtitle: {
    fontSize: 13,
    color: C.muted,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
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
  listScroll: { flexShrink: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
});
