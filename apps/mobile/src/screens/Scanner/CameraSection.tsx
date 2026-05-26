import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { CameraView, Camera, type BarcodeType } from 'expo-camera';
import { useTranslation } from 'react-i18next';

interface Props {
  isScanActive: boolean;
  onActivate: () => void;
  onBarcodeScanned: (event: { data: string }) => void;
}

// Stable outside component — no re-renders
const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'code128', 'code39'];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CAMERA_HEIGHT = Math.round(SCREEN_HEIGHT * 0.6);

const FRAME_WIDTH = 260;
const FRAME_HEIGHT = 180;
const CORNER_SIZE = 20;
const CORNER_THICKNESS = 3;

export default function CameraSection({ isScanActive, onActivate, onBarcodeScanned }: Props) {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<{ granted: boolean } | null>(null);

  // Stable refs — iOS New Architecture: CameraView prop must not toggle
  // undefined <-> function. Use refs so callback reference never changes.
  const isScanActiveRef = useRef(isScanActive);
  isScanActiveRef.current = isScanActive;
  const onBarcodeScannedRef = useRef(onBarcodeScanned);
  onBarcodeScannedRef.current = onBarcodeScanned;

  // Pulse animation for the scanning frame glow
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Stable callback: created once, reads latest state via refs
  const stableOnBarcodeScanned = useCallback((event: { data: string }) => {
    if (!isScanActiveRef.current) return;
    onBarcodeScannedRef.current(event);
  }, []);

  useEffect(() => {
    Camera.getCameraPermissionsAsync().then(setPermission);
  }, []);

  // Start pulse animation when scan is active
  useEffect(() => {
    if (!isScanActive) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isScanActive, pulseAnim]);

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
        <Text style={styles.permissionText}>{t('scanner.permissionTitle')}</Text>
        <TouchableOpacity style={styles.activateBtn} onPress={requestPermission}>
          <Text style={styles.activateBtnText}>{t('scanner.permissionButton')}</Text>
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

      {/* Dark overlay with clear scanning zone */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayMiddleRow}>
        <View style={styles.overlaySide} />
        {/* Clear scanning zone — no background */}
        <View style={styles.clearZone} />
        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom} />

      {/* Scanning frame with animated corners */}
      <View style={styles.frameContainer}>
        <Text style={styles.scanHint}>{t('scanner.scanHint')}</Text>

        <Animated.View style={[styles.frame, { opacity: isScanActive ? pulseAnim : 1 }]}>
          {/* Top-left corner */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          {/* Top-right corner */}
          <View style={[styles.corner, styles.cornerTopRight]} />
          {/* Bottom-left corner */}
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          {/* Bottom-right corner */}
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </Animated.View>
      </View>

      {!isScanActive && (
        <TouchableOpacity style={styles.activateBtn} onPress={onActivate}>
          <Text style={styles.activateBtnText}>{t('scanner.modeScan')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const OVERLAY_SIDE_WIDTH = (Dimensions.get('window').width - FRAME_WIDTH) / 2;

const styles = StyleSheet.create({
  cameraContainer: {
    height: CAMERA_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  // Overlay split into 3 rows: top / middle / bottom
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (CAMERA_HEIGHT - FRAME_HEIGHT) / 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayMiddleRow: {
    position: 'absolute',
    top: (CAMERA_HEIGHT - FRAME_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: FRAME_HEIGHT,
    flexDirection: 'row',
  },
  overlaySide: {
    width: OVERLAY_SIDE_WIDTH,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  clearZone: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
  },
  overlayBottom: {
    position: 'absolute',
    top: (CAMERA_HEIGHT - FRAME_HEIGHT) / 2 + FRAME_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  // Frame positioned at center of camera view
  frameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  frame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: '#2563EB',
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: '#2563EB',
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: '#2563EB',
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: '#2563EB',
    borderBottomRightRadius: 6,
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    gap: 16,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  activateBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
