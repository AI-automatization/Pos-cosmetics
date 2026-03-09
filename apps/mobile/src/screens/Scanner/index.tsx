import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProductResultCard from './ProductResultCard';
import CameraSection from './CameraSection';
import CountSection from './CountSection';
import CountQtyModal from './CountQtyModal';
import { useScannerData } from './useScannerData';

export default function ScannerScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanActive, setIsScanActive] = useState(false);
  const [countModalVisible, setCountModalVisible] = useState(false);
  const [pendingActualQty, setPendingActualQty] = useState('');

  const {
    mode, setMode,
    productQuery, stockQuery,
    handleBarcodeScan, resetScan,
    countEntries, addCountEntry, clearCountEntries,
    totalSystemQty, totalActualQty,
  } = useScannerData();

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
      };
    }, [resetScan]),
  );

  const handleScanAgain = useCallback(() => {
    resetScan();
    setPendingActualQty('');
    setIsScanActive(true);
  }, [resetScan]);

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

  if (!permission) return <LoadingSpinner />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>{t('scanner.permissionTitle')}</Text>
          <Text style={styles.permissionMessage}>{t('scanner.permissionMessage')}</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>{t('scanner.permissionButton')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasResult = productQuery.data !== undefined;
  const isLoading = productQuery.isFetching || stockQuery.isFetching;
  const showCountSection = mode === 'count' && !isScanActive && !hasResult;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'scan' && styles.modeBtnActive]}
          onPress={() => { setMode('scan'); resetScan(); setIsScanActive(false); }}
        >
          <Text style={[styles.modeBtnText, mode === 'scan' && styles.modeBtnTextActive]}>
            {t('scanner.modeScan')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'count' && styles.modeBtnActive]}
          onPress={() => { setMode('count'); resetScan(); setIsScanActive(false); }}
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
          {isFocused && (isScanActive || (!hasResult && !isLoading)) && (
            <CameraSection
              isScanActive={isScanActive}
              onActivate={() => setIsScanActive(true)}
              onBarcodeScanned={onBarcodeScanned}
            />
          )}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
            </View>
          )}
          {productQuery.isError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.errorText}>{t('scanner.notFound')}</Text>
              <TouchableOpacity style={styles.scanBtn} onPress={handleScanAgain}>
                <Text style={styles.scanBtnText}>{t('scanner.scanAgain')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {hasResult && !isLoading && !productQuery.isError && (
            <ScrollView style={styles.resultScroll}>
              <ProductResultCard
                product={productQuery.data}
                stockLevels={stockQuery.data ?? []}
                onScanAgain={handleScanAgain}
                onAddToCount={mode === 'count' ? handleAddToCount : undefined}
                isCountMode={mode === 'count'}
              />
              {mode === 'count' && (
                <TouchableOpacity
                  style={[styles.scanBtn, styles.countAddBtn]}
                  onPress={handleAddToCount}
                >
                  <Text style={styles.scanBtnText}>+ {t('scanner.countAdd')}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      )}

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
    paddingVertical: 8,
    gap: 8,
  },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#F3F4F6' },
  modeBtnActive: { backgroundColor: '#6366F1' },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  modeBtnTextActive: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorIcon: { fontSize: 40 },
  errorText: { fontSize: 16, color: '#374151', fontWeight: '600' },
  resultScroll: { flex: 1, paddingTop: 16 },
  scanBtn: { margin: 16, backgroundColor: '#6366F1', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  scanBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  countAddBtn: { backgroundColor: '#059669', marginTop: 0 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  permissionIcon: { fontSize: 48 },
  permissionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  permissionMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  permissionBtn: { marginTop: 8, backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  permissionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
