import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductResultCard from './ProductResultCard';
import CameraSection from './CameraSection';
import CountSection from './CountSection';
import CountQtyModal from './CountQtyModal';
import ScannerPermissionView from './ScannerPermissionView';
import ManualBarcodeInput from './ManualBarcodeInput';
import { useScannerData } from './useScannerData';

export default function ScannerScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [permission, setPermission] = useState<{ granted: boolean } | null>(null);
  const [isScanActive, setIsScanActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [countModalVisible, setCountModalVisible] = useState(false);
  const [pendingActualQty, setPendingActualQty] = useState('');

  const {
    mode, setMode,
    productQuery, stockQuery,
    handleBarcodeScan, resetScan,
    countEntries, addCountEntry, clearCountEntries,
    totalSystemQty, totalActualQty,
  } = useScannerData();

  useEffect(() => {
    Camera.getCameraPermissionsAsync().then(setPermission);
  }, []);

  const requestPermission = async () => {
    const result = await Camera.requestCameraPermissionsAsync();
    setPermission(result);
  };

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (!isScanActive) return;
      setIsScanActive(false);
      handleBarcodeScan(data);
    },
    [isScanActive, handleBarcodeScan],
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsScanActive(false);
        resetScan();
        setManualInput('');
      };
    }, [resetScan]),
  );

  const handleScanAgain = useCallback(() => {
    resetScan();
    setPendingActualQty('');
    setManualInput('');
    setIsScanActive(true);
  }, [resetScan]);

  const handleManualSearch = useCallback(() => {
    const trimmed = manualInput.trim();
    if (trimmed.length === 0) return;
    handleBarcodeScan(trimmed);
  }, [manualInput, handleBarcodeScan]);

  const handleAddToCount = useCallback(() => {
    if (!productQuery.data || !stockQuery.data) return;
    const systemQty = stockQuery.data.reduce((s, l) => s + l.stock, 0);
    setPendingActualQty(String(systemQty));
    setCountModalVisible(true);
  }, [productQuery.data, stockQuery.data]);

  const handleConfirmCount = useCallback(() => {
    if (!productQuery.data || !stockQuery.data) return;
    const systemQty = stockQuery.data.reduce((s, l) => s + l.stock, 0);
    const actual = parseInt(pendingActualQty, 10);
    if (isNaN(actual) || actual < 0) return;
    addCountEntry(productQuery.data, systemQty, actual);
    setCountModalVisible(false);
    setPendingActualQty('');
    handleScanAgain();
  }, [productQuery.data, stockQuery.data, pendingActualQty, addCountEntry, handleScanAgain]);

  const handleModeSwitch = useCallback(
    (newMode: 'scan' | 'count') => {
      setMode(newMode);
      resetScan();
      setIsScanActive(false);
      setManualInput('');
    },
    [setMode, resetScan],
  );

  if (!permission) return <LoadingSpinner />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScannerPermissionView onRequestPermission={requestPermission} />
      </SafeAreaView>
    );
  }

  const hasResult = productQuery.data !== undefined;
  const isLoading = productQuery.isFetching || stockQuery.isFetching;
  const showCountSection = mode === 'count' && !isScanActive && !hasResult;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Mode tabs */}
        <View style={styles.modeBar}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'scan' && styles.modeBtnActive]}
            onPress={() => handleModeSwitch('scan')}
          >
            <Text style={[styles.modeBtnText, mode === 'scan' && styles.modeBtnTextActive]}>
              {t('scanner.modeScan')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'count' && styles.modeBtnActive]}
            onPress={() => handleModeSwitch('count')}
          >
            <Text style={[styles.modeBtnText, mode === 'count' && styles.modeBtnTextActive]}>
              {t('scanner.modeCount')}
            </Text>
          </TouchableOpacity>
        </View>

        {showCountSection ? (
          <CountSection
            countEntries={countEntries}
            totalSystemQty={totalSystemQty}
            totalActualQty={totalActualQty}
            onClear={clearCountEntries}
            onStartScan={() => { resetScan(); setIsScanActive(true); }}
          />
        ) : (
          <View style={styles.flex}>
            {/* Camera — 60% height, shown when scanning or waiting for first scan */}
            {isFocused && (isScanActive || (!hasResult && !isLoading)) && (
              <CameraSection
                isScanActive={isScanActive}
                onActivate={() => setIsScanActive(true)}
                onBarcodeScanned={onBarcodeScanned}
              />
            )}

            {/* Manual barcode input — shown when idle (no result, not loading) */}
            {!isScanActive && !hasResult && !isLoading && (
              <ManualBarcodeInput
                value={manualInput}
                onChangeText={setManualInput}
                onSearch={handleManualSearch}
              />
            )}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <LoadingSpinner />
              </View>
            )}

            {productQuery.isError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>🔍</Text>
                <Text style={styles.errorText}>{t('scanner.notFound')}</Text>
                <TouchableOpacity style={styles.scanBtn} onPress={handleScanAgain}>
                  <Text style={styles.scanBtnText}>{t('scanner.scanAgain')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {hasResult && !isLoading && !productQuery.isError && (
              <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
                <ProductResultCard
                  product={productQuery.data}
                  stockLevels={stockQuery.data ?? []}
                  onScanAgain={handleScanAgain}
                  onAddToCount={mode === 'count' ? handleAddToCount : undefined}
                  isCountMode={mode === 'count'}
                />
                {mode === 'count' && (
                  <TouchableOpacity style={styles.countAddBtn} onPress={handleAddToCount}>
                    <Text style={styles.countAddBtnText}>+ {t('scanner.countAdd')}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      <CountQtyModal
        visible={countModalVisible}
        productName={productQuery.data?.name}
        qty={pendingActualQty}
        onChangeQty={setPendingActualQty}
        onConfirm={handleConfirmCount}
        onClose={() => setCountModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  modeBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    minHeight: 40,
    justifyContent: 'center',
  },
  modeBtnActive: { backgroundColor: '#2563EB' },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  modeBtnTextActive: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  errorIcon: { fontSize: 40 },
  errorText: { fontSize: 16, color: '#374151', fontWeight: '600', textAlign: 'center' },
  resultScroll: { flex: 1 },
  resultContent: { paddingVertical: 16, paddingBottom: 32 },
  scanBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  scanBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  countAddBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  countAddBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
