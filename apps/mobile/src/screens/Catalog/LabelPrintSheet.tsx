import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBtPrinter } from '../../hooks/useBtPrinter';
import { buildTsplLabel } from '../../lib/tsplBuilder';
import type { LabelSize as TsplLabelSize } from '../../lib/tsplBuilder';
import BtDeviceList from './BtDeviceList';
import { styles, C } from './LabelPrintSheet.styles';
import {
  LABEL_SIZES,
  MIN_COPIES,
  MAX_COPIES,
  DEFAULT_COPIES,
  DEFAULT_SIZE,
  buildLabelHtml,
} from './LabelPrintConstants';
import type { LabelSize, PrintMode, LabelPrintSheetProps } from './LabelPrintConstants';

// ─── expo-print dynamic import ────────────────────────────────────────────────
// expo-print o'rnatilmagan muhitlarda xatolik chiqmasligi uchun lazy require
let expoPrint: { printAsync: (opts: { html: string }) => Promise<void> } | null = null;
try {
  // @ts-ignore
  expoPrint = require('expo-print');
} catch {
  // expo-print mavjud emas — Share sheet fallback ishlatiladi
}

// ─── LabelPrintSheet ──────────────────────────────────────────────────────────
export function LabelPrintSheet({ product, onClose }: LabelPrintSheetProps) {
  const { t } = useTranslation();
  const bt = useBtPrinter();

  const [printMode, setPrintMode]       = useState<PrintMode>('system');
  const [selectedSize, setSelectedSize] = useState<LabelSize>(DEFAULT_SIZE);
  const [copies, setCopies]             = useState<number>(DEFAULT_COPIES);
  const [loading, setLoading]           = useState(false);

  const isBtReady = printMode === 'bluetooth' && bt.connectedDevice !== null;
  const canPrint  = printMode === 'system' || isBtReady;

  const handleDecrease = () => setCopies((prev) => Math.max(MIN_COPIES, prev - 1));
  const handleIncrease = () => setCopies((prev) => Math.min(MAX_COPIES, prev + 1));

  const handleClose = () => {
    if (loading || bt.isPrinting) return;
    setCopies(DEFAULT_COPIES);
    setSelectedSize(DEFAULT_SIZE);
    onClose();
  };

  const handlePrint = async () => {
    if (!product) return;

    if (printMode === 'bluetooth') {
      const tspl = buildTsplLabel(
        {
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          price: product.sellPrice,
        },
        selectedSize as TsplLabelSize,
        copies,
      );
      await bt.printTspl(tspl);
      return;
    }

    // System print mode
    setLoading(true);
    try {
      const html = buildLabelHtml(product, selectedSize, copies);
      if (expoPrint) {
        await expoPrint.printAsync({ html });
      } else {
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

  const previewBarcode = product?.barcode ? `||| ${product.barcode} |||` : null;
  const isProcessing = loading || bt.isPrinting;

  return (
    <Modal
      visible={product !== null}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('catalog.labelPrint.title')}</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            disabled={isProcessing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Print mode tanlash */}
          <Text style={styles.sectionLabel}>CHOP ETISH USULI</Text>
          <View style={styles.pillRow}>
            <TouchableOpacity
              style={[styles.pill, printMode === 'system' && styles.pillActive]}
              onPress={() => setPrintMode('system')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="document-outline"
                size={16}
                color={printMode === 'system' ? C.pillActiveText : C.pillText}
              />
              <Text style={[styles.pillText, printMode === 'system' && styles.pillTextActive]}>
                Tizim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, printMode === 'bluetooth' && styles.pillActive]}
              onPress={() => setPrintMode('bluetooth')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="bluetooth"
                size={16}
                color={printMode === 'bluetooth' ? C.pillActiveText : C.pillText}
              />
              <Text style={[styles.pillText, printMode === 'bluetooth' && styles.pillTextActive]}>
                Bluetooth
              </Text>
            </TouchableOpacity>
          </View>

          {/* BT device selection */}
          {printMode === 'bluetooth' ? (
            <BtDeviceList
              isAvailable={bt.isAvailable}
              isScanning={bt.isScanning}
              devices={bt.devices}
              connectedDevice={bt.connectedDevice}
              error={bt.error}
              onScan={bt.scan}
              onConnect={bt.connect}
              onDisconnect={bt.disconnect}
            />
          ) : null}

          {/* Label o'lchami */}
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
              <Ionicons name="remove" size={20} color={copies <= MIN_COPIES ? C.muted : C.text} />
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
              <Ionicons name="add" size={20} color={copies >= MAX_COPIES ? C.muted : C.text} />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={styles.previewBox}>
            <Text style={styles.previewProductName} numberOfLines={2}>
              {product?.name ?? ''}
            </Text>
            {product?.sku ? <Text style={styles.previewSku}>SKU: {product.sku}</Text> : null}
            {previewBarcode ? <Text style={styles.previewBarcode}>{previewBarcode}</Text> : null}
            <Text style={styles.previewPrice}>
              {(product?.sellPrice ?? 0).toLocaleString('uz-UZ')} so'm
            </Text>
          </View>
        </ScrollView>

        {/* Action tugmalar */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleClose}
            disabled={isProcessing}
          >
            <Text style={styles.cancelBtnText}>{t('catalog.labelPrint.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.printBtn, (isProcessing || !canPrint) && styles.btnDisabled]}
            onPress={handlePrint}
            disabled={isProcessing || !canPrint}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name={printMode === 'bluetooth' ? 'bluetooth' : 'print-outline'}
                  size={18}
                  color={C.white}
                />
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

export default LabelPrintSheet;
