import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BtDevice } from '../../hooks/useBtPrinter';

const C = {
  white: '#FFFFFF',
  text: '#111827',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  primary: '#2563EB',
  bg: '#F9FAFB',
  success: '#059669',
  successBg: '#ECFDF5',
};

interface Props {
  readonly isAvailable: boolean;
  readonly isScanning: boolean;
  readonly devices: readonly BtDevice[];
  readonly connectedDevice: BtDevice | null;
  readonly error: string | null;
  readonly onScan: () => void;
  readonly onConnect: (address: string) => void;
  readonly onDisconnect: () => void;
}

export default function BtDeviceList({
  isAvailable, isScanning, devices, connectedDevice,
  error, onScan, onConnect, onDisconnect,
}: Props) {
  if (!isAvailable) {
    return (
      <View style={styles.unavailable}>
        <Ionicons name="warning-outline" size={20} color={C.muted} />
        <Text style={styles.unavailableText}>
          Bluetooth printer moduli mavjud emas.{'\n'}
          EAS build talab qilinadi.
        </Text>
      </View>
    );
  }

  if (connectedDevice) {
    return (
      <View style={styles.connected}>
        <Ionicons name="bluetooth" size={18} color={C.success} />
        <View style={styles.connectedInfo}>
          <Text style={styles.connectedName}>{connectedDevice.name}</Text>
          <Text style={styles.connectedAddr}>{connectedDevice.address}</Text>
        </View>
        <TouchableOpacity style={styles.disconnectBtn} onPress={onDisconnect}>
          <Text style={styles.disconnectText}>Uzish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={onScan}
        disabled={isScanning}
        activeOpacity={0.75}
      >
        {isScanning ? (
          <ActivityIndicator size="small" color={C.primary} />
        ) : (
          <Ionicons name="search-outline" size={16} color={C.primary} />
        )}
        <Text style={styles.scanText}>
          {isScanning ? 'Qidirilmoqda...' : 'Printerlarni qidirish'}
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {devices.length > 0 ? (
        <FlatList
          data={devices}
          keyExtractor={(d) => d.address}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceRow}
              onPress={() => onConnect(item.address)}
              activeOpacity={0.75}
            >
              <Ionicons name="print-outline" size={18} color={C.text} />
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceAddr}>{item.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      ) : !isScanning ? (
        <Text style={styles.hint}>Printer topish uchun qidirishni boshlang</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 12 },
  unavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  unavailableText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.successBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  connectedInfo: { flex: 1 },
  connectedName: { fontSize: 14, fontWeight: '600', color: C.success },
  connectedAddr: { fontSize: 11, color: C.muted },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  disconnectText: { fontSize: 12, fontWeight: '600', color: C.muted },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.primary,
    backgroundColor: '#EFF6FF',
  },
  scanText: { fontSize: 13, fontWeight: '600', color: C.primary },
  error: { fontSize: 12, color: '#DC2626', paddingHorizontal: 4 },
  hint: { fontSize: 12, color: C.muted, textAlign: 'center', paddingVertical: 8 },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.bg,
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 13, fontWeight: '600', color: C.text },
  deviceAddr: { fontSize: 11, color: C.muted },
  sep: { height: 4 },
});
