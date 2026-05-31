import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

// ─── Safe dynamic import ────────────────────────────────────────────────────
// react-native-bluetooth-escpos-printer mavjud bo'lmasligi mumkin (Expo Go)
let BtManager: {
  isBluetoothEnabled: () => Promise<boolean>;
  enableBluetooth: () => Promise<void>;
  scanDevices: () => Promise<string>;
  connect: (address: string) => Promise<void>;
} | null = null;

let BtPrinter: {
  printRawData: (data: string) => Promise<void>;
} | null = null;

try {
  const mod = require('react-native-bluetooth-escpos-printer');
  BtManager = mod.BluetoothManager;
  BtPrinter = mod.BluetoothEscposPrinter;
} catch {
  // Not available — isAvailable will be false
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface BtDevice {
  name: string;
  address: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
type RawDevice = { name?: string; address?: string };

function toDevices(arr: unknown): BtDevice[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((d: RawDevice) => d.address)
    .map((d: RawDevice) => ({ name: d.name ?? d.address!, address: d.address! }));
}

function parseScanResult(raw: string): BtDevice[] {
  try {
    const p = JSON.parse(raw);
    const seen = new Set<string>();
    return [...toDevices(p.paired), ...toDevices(p.found)].filter((d) => {
      if (seen.has(d.address)) return false;
      seen.add(d.address);
      return true;
    });
  } catch {
    return [];
  }
}

function extractMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useBtPrinter() {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BtDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BtDevice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAvailable = BtManager !== null && BtPrinter !== null;
  const connectedRef = useRef<BtDevice | null>(null);

  useEffect(() => { connectedRef.current = connectedDevice; }, [connectedDevice]);

  // Disconnect on unmount
  useEffect(() => () => {
    if (connectedRef.current && BtManager) {
      BtManager.connect('').catch(() => {});
    }
  }, []);

  const scan = useCallback(async () => {
    if (!BtManager) { setError(t('printer.btNotAvailable')); return; }
    setError(null);
    setIsScanning(true);
    try {
      const enabled = await BtManager.isBluetoothEnabled();
      if (!enabled) {
        if (Platform.OS === 'android') {
          await BtManager.enableBluetooth();
        } else {
          setError(t('printer.btDisabled'));
          setIsScanning(false);
          return;
        }
      }
      setDevices(parseScanResult(await BtManager.scanDevices()));
    } catch (err) {
      setError(extractMsg(err, t('printer.scanError')));
    } finally {
      setIsScanning(false);
    }
  }, [t]);

  const connect = useCallback(async (address: string) => {
    if (!BtManager) { setError(t('printer.btNotAvailable')); return; }
    setError(null);
    try {
      await BtManager.connect(address);
      const device = devices.find((d) => d.address === address)
        ?? { name: address, address };
      setConnectedDevice(device);
    } catch (err) {
      setError(extractMsg(err, t('printer.connectError')));
      setConnectedDevice(null);
    }
  }, [devices, t]);

  const disconnect = useCallback(async () => {
    setError(null);
    setConnectedDevice(null);
  }, []);

  const printTspl = useCallback(async (commands: string) => {
    if (!BtPrinter) { setError(t('printer.btNotAvailable')); return; }
    if (!connectedDevice) { setError(t('printer.notConnected')); return; }
    setError(null);
    setIsPrinting(true);
    try {
      await BtPrinter.printRawData(commands);
    } catch (err) {
      setError(extractMsg(err, t('printer.printError')));
    } finally {
      setIsPrinting(false);
    }
  }, [connectedDevice, t]);

  return {
    isAvailable, isScanning, devices, connectedDevice,
    isPrinting, error, scan, connect, disconnect, printTspl,
  } as const;
}
