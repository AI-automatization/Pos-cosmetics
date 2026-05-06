import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// ─── expo-print dynamic import ────────────────────────────────────────────────
// expo-print o'rnatilmagan muhitlarda xatolik chiqmasligi uchun lazy require
let expoPrint: { printAsync: (opts: { html: string }) => Promise<void> } | null = null;
try {
  // @ts-ignore
  expoPrint = require('expo-print');
} catch {
  // expo-print mavjud emas — Share sheet fallback ishlatiladi
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg:               '#F9FAFB',
  white:            '#FFFFFF',
  text:             '#111827',
  muted:            '#9CA3AF',
  border:           '#E5E7EB',
  primary:          '#2563EB',
  handle:           '#E5E7EB',
  preview:          '#F3F4F6',
  pillActive:       '#EFF6FF',
  pillActiveBorder: '#2563EB',
  pillActiveText:   '#2563EB',
  pillText:         '#374151',
  surface:          '#F3F4F6',
};

// ─── Label o'lchamlari ────────────────────────────────────────────────────────
const LABEL_SIZES = [
  { key: '30x20', label: '30×20 mm' },
  { key: '40x30', label: '40×30 mm' },
  { key: '58x40', label: '58×40 mm' },
] as const;

type LabelSize = typeof LABEL_SIZES[number]['key'];

const SIZE_DIMS: Record<LabelSize, { w: string; h: string; fontSize: string }> = {
  '30x20': { w: '30mm', h: '20mm', fontSize: '7pt' },
  '40x30': { w: '40mm', h: '30mm', fontSize: '8pt' },
  '58x40': { w: '58mm', h: '40mm', fontSize: '9pt' },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_COPIES     = 1;
const MAX_COPIES     = 99;
const DEFAULT_COPIES = 1;
const DEFAULT_SIZE: LabelSize = '40x30';

// ─── Props ────────────────────────────────────────────────────────────────────
interface LabelPrintSheetProps {
  readonly product: {
    readonly id: string;
    readonly name: string;
    readonly barcode?: string | null;
    readonly sellPrice: number;
    readonly sku?: string | null;
  } | null;
  readonly onClose: () => void;
}

// ─── HTML generator ───────────────────────────────────────────────────────────
function buildLabelHtml(
  product: NonNullable<LabelPrintSheetProps['product']>,
  size: LabelSize,
  copies: number,
): string {
  const { w, h, fontSize } = SIZE_DIMS[size];
  const priceFormatted = product.sellPrice.toLocaleString('uz-UZ');

  const label = `
    <div style="
      width:${w};height:${h};border:1px solid #ccc;padding:2mm;
      font-family:monospace;display:flex;flex-direction:column;
      justify-content:space-between;page-break-inside:avoid;box-sizing:border-box;
    ">
      <div style="font-size:${fontSize};font-weight:bold;line-height:1.2;overflow:hidden">
        ${product.name}
      </div>
      ${product.sku ? `<div style="font-size:6pt;color:#555">SKU: ${product.sku}</div>` : ''}
      ${product.barcode ? `<div style="font-size:6pt;letter-spacing:1px">|||${product.barcode}|||</div>` : ''}
      <div style="font-size:${fontSize};font-weight:bold">${priceFormatted} so'm</div>
    </div>
  `;

  const labels = Array(copies).fill(label).join('');
  return `<html><body style="margin:0;display:flex;flex-wrap:wrap;gap:2mm;padding:2mm">${labels}</body></html>`;
}

// ─── LabelPrintSheet ──────────────────────────────────────────────────────────
export function LabelPrintSheet({ product, onClose }: LabelPrintSheetProps) {
  const { t } = useTranslation();

  const [selectedSize, setSelectedSize] = useState<LabelSize>(DEFAULT_SIZE);
  const [copies, setCopies]             = useState<number>(DEFAULT_COPIES);
  const [loading, setLoading]           = useState(false);

  const handleDecrease = () => {
    setCopies((prev) => Math.max(MIN_COPIES, prev - 1));
  };

  const handleIncrease = () => {
    setCopies((prev) => Math.min(MAX_COPIES, prev + 1));
  };

  const handleClose = () => {
    if (loading) return;
    setCopies(DEFAULT_COPIES);
    setSelectedSize(DEFAULT_SIZE);
    onClose();
  };

  const handlePrint = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const html = buildLabelHtml(product, selectedSize, copies);
      if (expoPrint) {
        await expoPrint.printAsync({ html });
      } else {
        // Fallback: Share sheet orqali
        await Share.share({
          message: `${product.name} — ${product.sellPrice.toLocaleString('uz-UZ')} so'm`,
          title: t('catalog.labelPrint.shareTitle'),
        });
      }
    } catch {
      // Foydalanuvchi print dialog ni yopdi yoki xatolik — silent
    } finally {
      setLoading(false);
    }
  };

  // Preview barcode simulyatsiya (monospace |||)
  const previewBarcode = product?.barcode
    ? `||| ${product.barcode} |||`
    : null;

  return (
    <Modal
      visible={product !== null}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Overlay — bosish orqali yopish */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('catalog.labelPrint.title')}</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            disabled={loading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* O'lcham tanlash */}
        <Text style={styles.sectionLabel}>{t('catalog.labelPrint.sizeLabel')}</Text>
        <View style={styles.pillRow}>
          {LABEL_SIZES.map((size) => {
            const isActive = selectedSize === size.key;
            return (
              <TouchableOpacity
                key={size.key}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setSelectedSize(size.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nusxa soni */}
        <Text style={styles.sectionLabel}>{t('catalog.labelPrint.copiesLabel')}</Text>
        <View style={styles.copiesRow}>
          <TouchableOpacity
            style={[styles.counterBtn, copies <= MIN_COPIES && styles.counterBtnDisabled]}
            onPress={handleDecrease}
            disabled={copies <= MIN_COPIES}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="remove"
              size={20}
              color={copies <= MIN_COPIES ? C.muted : C.text}
            />
          </TouchableOpacity>

          <View style={styles.counterValue}>
            <Text style={styles.counterText}>{copies}</Text>
          </View>

          <TouchableOpacity
            style={[styles.counterBtn, copies >= MAX_COPIES && styles.counterBtnDisabled]}
            onPress={handleIncrease}
            disabled={copies >= MAX_COPIES}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="add"
              size={20}
              color={copies >= MAX_COPIES ? C.muted : C.text}
            />
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.previewBox}>
          <Text style={styles.previewProductName} numberOfLines={2}>
            {product?.name ?? ''}
          </Text>
          {product?.sku ? (
            <Text style={styles.previewSku}>SKU: {product.sku}</Text>
          ) : null}
          {previewBarcode ? (
            <Text style={styles.previewBarcode}>{previewBarcode}</Text>
          ) : null}
          <Text style={styles.previewPrice}>
            {(product?.sellPrice ?? 0).toLocaleString('uz-UZ')} so'm
          </Text>
        </View>

        {/* Action tugmalar */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>{t('catalog.labelPrint.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.printBtn, loading && styles.btnDisabled]}
            onPress={handlePrint}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <>
                <Ionicons name="print-outline" size={18} color={C.white} />
                <Text style={styles.printBtnText}>
                  {t('catalog.labelPrint.printButton', { count: copies })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.handle,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: C.pillActive,
    borderColor: C.pillActiveBorder,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.pillText,
  },
  pillTextActive: {
    color: C.pillActiveText,
  },
  copiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  counterText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  previewBox: {
    backgroundColor: C.preview,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
    gap: 4,
  },
  previewProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    lineHeight: 20,
  },
  previewSku: {
    fontSize: 12,
    color: C.muted,
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  previewBarcode: {
    fontSize: 12,
    color: C.text,
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.muted,
  },
  printBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
});

export default LabelPrintSheet;
