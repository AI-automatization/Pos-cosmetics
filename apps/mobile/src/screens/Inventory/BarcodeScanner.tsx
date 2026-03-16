import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { catalogApi } from '@/api';
import { formatCurrency } from '@/utils/format';
import { extractErrorMessage } from '@/utils/error';
import type { InventoryStackParamList } from '@/navigation/types';
import type { ProductInfo } from '@/api/catalog.api';

type NavProp = NativeStackNavigationProp<InventoryStackParamList, 'BarcodeScanner'>;

export default function BarcodeScannerScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleBarcodeScan = useCallback(
    async ({ data: barcode }: { data: string }): Promise<void> => {
      if (scanned || loading) return;
      setScanned(true);
      setLoading(true);
      setScanError(null);
      setProduct(null);
      try {
        const result = await catalogApi.getByBarcode(barcode);
        setProduct(result);
      } catch (err) {
        setScanError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [scanned, loading],
  );

  const handleRescan = (): void => {
    setScanned(false);
    setProduct(null);
    setScanError(null);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>{t('scanner.permissionRequired')}</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>{t('scanner.allowCamera')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'qr'] }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>{t('scanner.scanHint')}</Text>
          </View>
        </CameraView>
      </View>

      {/* Result */}
      <View style={styles.resultContainer}>
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#1a56db" />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        )}

        {scanError && (
          <Card>
            <Text style={styles.errorText}>{scanError}</Text>
            <TouchableOpacity style={styles.btn} onPress={handleRescan}>
              <Text style={styles.btnText}>{t('scanner.scanAgain')}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {product && !loading && (
          <Card>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{product.name}</Text>
              <Badge label={product.categoryName} variant="info" />
            </View>

            <View style={styles.productGrid}>
              <View style={styles.productField}>
                <Text style={styles.fieldLabel}>{t('scanner.price')}</Text>
                <Text style={styles.fieldValue}>
                  {formatCurrency(product.sellPrice, product.currency)}
                </Text>
              </View>
              <View style={styles.productField}>
                <Text style={styles.fieldLabel}>{t('scanner.stock')}</Text>
                <Text style={[styles.fieldValue, product.stockQuantity <= 0 && styles.outOfStock]}>
                  {product.stockQuantity} {product.unitName}
                </Text>
              </View>
              <View style={styles.productField}>
                <Text style={styles.fieldLabel}>{t('scanner.sku')}</Text>
                <Text style={styles.fieldValueSm}>{product.sku}</Text>
              </View>
              {product.expiryDate && (
                <View style={styles.productField}>
                  <Text style={styles.fieldLabel}>{t('scanner.expiry')}</Text>
                  <Text style={styles.fieldValueSm}>{product.expiryDate.slice(0, 10)}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleRescan}>
              <Text style={styles.btnText}>{t('scanner.scanAgain')}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {!scanned && !loading && !product && !scanError && (
          <View style={styles.idleBox}>
            <Text style={styles.idleText}>{t('scanner.ready')}</Text>
          </View>
        )}
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 220,
    height: 140,
    borderWidth: 2,
    borderColor: '#1a56db',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#fff',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    maxHeight: 320,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  productField: {
    minWidth: '45%',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  fieldValueSm: {
    fontSize: 14,
    color: '#374151',
  },
  outOfStock: {
    color: '#dc2626',
  },
  btn: {
    backgroundColor: '#1a56db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  idleBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  idleText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
