import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraSection from '../Scanner/CameraSection';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
}

export default function ScannerModal({ visible, onClose, onScanned }: Props) {
  // Start as true — component only mounts when visible=true (see `if (!visible) return null` below).
  // Avoids first-render isScanActive=false → true transition which on iOS + New Architecture
  // caused CameraView to initialize without barcode scanner enabled.
  const [isScanActive, setIsScanActive] = useState(true);

  useEffect(() => {
    if (visible) setIsScanActive(true);
  }, [visible]);

  const handleBarcode = ({ data }: { data: string }) => {
    setIsScanActive(false);
    onScanned(data);
  };

  // <Modal> replaced with absoluteFill View — React 19.1 + RN 0.81 Modal portal
  // causes hooks dispatcher to be null inside Modal children (useRef of null).
  // AbsoluteFill View achieves the same visual effect within the same React tree.
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <CameraSection
        isScanActive={isScanActive}
        onActivate={() => setIsScanActive(true)}
        onBarcodeScanned={handleBarcode}
      />
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
