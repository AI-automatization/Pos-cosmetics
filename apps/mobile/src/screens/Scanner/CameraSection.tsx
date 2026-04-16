import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera, type BarcodeType } from 'expo-camera';
import { useTranslation } from 'react-i18next';

interface Props {
  isScanActive: boolean;
  onActivate: () => void;
  onBarcodeScanned: (event: { data: string }) => void;
}

// Barcode types outside component — stable reference, no re-renders
const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'code128', 'code39'];

export default function CameraSection({ isScanActive, onActivate, onBarcodeScanned }: Props) {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<{ granted: boolean } | null>(null);

  // Stable refs — iOS New Architecture: CameraView prop must not toggle
  // undefined ↔ function. Use refs so callback reference never changes.
  const isScanActiveRef = useRef(isScanActive);
  isScanActiveRef.current = isScanActive;
  const onBarcodeScannedRef = useRef(onBarcodeScanned);
  onBarcodeScannedRef.current = onBarcodeScanned;

  // Stable callback: created once, reads latest state via refs
  const stableOnBarcodeScanned = useCallback((event: { data: string }) => {
    if (!isScanActiveRef.current) return;
    onBarcodeScannedRef.current(event);
  }, []);

  useEffect(() => {
    Camera.getCameraPermissionsAsync().then(setPermission);
  }, []);

  const requestPermission = async () => {
    const result = await Camera.requestCameraPermissionsAsync();
    setPermission(result);
  };

  if (!permission) {
    return <View style={styles.cameraContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.cameraContainer, styles.permissionContainer]}>
        <Text style={styles.permissionText}>Kamera ruxsati kerak</Text>
        <TouchableOpacity style={styles.activateBtn} onPress={requestPermission}>
          <Text style={styles.activateBtnText}>📷 Ruxsat berish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={stableOnBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.scanHint}>{t('scanner.scanHint')}</Text>
      </View>
      {!isScanActive && (
        <TouchableOpacity style={styles.activateBtn} onPress={onActivate}>
          <Text style={styles.activateBtnText}>📷 {t('scanner.modeScan')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 16,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  scanFrame: {
    width: 240,
    height: 160,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanHint: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  activateBtn: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  activateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
