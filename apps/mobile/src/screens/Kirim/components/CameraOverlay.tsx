import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import CameraSection from '../../Scanner/CameraSection';
import { C, CAMERA_MARGIN_TOP, SHEET_PADDING_BOTTOM } from './types';

interface CameraOverlayProps {
  scanLoading: boolean;
  isScanActive: boolean;
  onActivate: () => void;
  onBarcodeScanned: (event: { data: string }) => void;
  onClose: () => void;
}

export default function CameraOverlay({
  scanLoading,
  isScanActive,
  onActivate,
  onBarcodeScanned,
  onClose,
}: CameraOverlayProps) {
  return (
    <View style={styles.cameraModal}>
      <View style={styles.cameraWrap}>
        <CameraSection
          isScanActive={isScanActive}
          onActivate={onActivate}
          onBarcodeScanned={onBarcodeScanned}
        />
      </View>

      {scanLoading && (
        <View style={styles.scanLoadingRow}>
          <ActivityIndicator color={C.primary} size="small" />
          <Text style={styles.scanLoadingText}>Mahsulot qidirilmoqda...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cameraCloseBtn} onPress={onClose}>
        <Text style={styles.cameraCloseBtnText}>Yopish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    paddingBottom: SHEET_PADDING_BOTTOM,
    zIndex: 100,
  },
  cameraWrap: {
    flex: 1,
    marginTop: CAMERA_MARGIN_TOP,
  },
  scanLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  scanLoadingText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cameraCloseBtn: {
    marginHorizontal: 24,
    backgroundColor: C.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cameraCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
});
