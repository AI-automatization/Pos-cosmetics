import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CameraSection from '../../Scanner/CameraSection';

interface OmborCameraOverlayProps {
  isScanActive: boolean;
  onActivate: () => void;
  onBarcodeScanned: (event: { data: string }) => void;
  onClose: () => void;
}

export default function OmborCameraOverlay({
  isScanActive,
  onActivate,
  onBarcodeScanned,
  onClose,
}: OmborCameraOverlayProps) {
  return (
    <View style={styles.cameraOverlay}>
      <CameraSection
        isScanActive={isScanActive}
        onActivate={onActivate}
        onBarcodeScanned={onBarcodeScanned}
      />
      <TouchableOpacity style={styles.cameraCloseBtn} onPress={onClose}>
        <Text style={styles.cameraCloseBtnText}>Yopish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
