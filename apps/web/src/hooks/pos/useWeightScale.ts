'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const SETTINGS_KEY = 'raos_weight_scale';

interface ScaleSettings {
  enabled: boolean;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'none' | 'even' | 'odd';
}

const DEFAULT_SETTINGS: ScaleSettings = {
  enabled: false,
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
};

function loadSettings(): ScaleSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ScaleSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Web Serial API integration for USB/Serial weight scales.
 * Works in Chromium browsers (Chrome, Edge, Tauri).
 * Common protocol: scale sends ASCII lines like "  1.234 kg\r\n"
 */
export function useWeightScale() {
  const [weight, setWeight] = useState<number>(0);
  const [unit, setUnit] = useState<string>('kg');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<ScaleSettings>(loadSettings);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  const updateSettings = useCallback((patch: Partial<ScaleSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const parseWeightLine = useCallback((line: string): { value: number; unit: string } | null => {
    // Common formats: "  1.234 kg", "1234 g", "0.5kg", "  12.3  "
    const cleaned = line.trim();
    if (!cleaned) return null;

    const match = cleaned.match(/([0-9]+\.?[0-9]*)\s*(kg|g|lb|oz)?/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    if (isNaN(value)) return null;

    return { value, unit: (match[2] ?? 'kg').toLowerCase() };
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError("Web Serial API qo'llab-quvvatlanmaydi. Chrome yoki Edge ishlating.");
      return;
    }

    try {
      setError(null);
      const port = await navigator.serial.requestPort();

      await port.open({
        baudRate: settings.baudRate,
        dataBits: settings.dataBits as 7 | 8,
        stopBits: settings.stopBits as 1 | 2,
        parity: settings.parity,
      });

      portRef.current = port;
      setConnected(true);

      const abort = new AbortController();
      abortRef.current = abort;

      // Read loop
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable!.pipeTo(textDecoder.writable as unknown as WritableStream<Uint8Array>, { signal: abort.signal }).catch(() => {});
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';

      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;

            buffer += value;
            const lines = buffer.split(/[\r\n]+/);
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const parsed = parseWeightLine(line);
              if (parsed) {
                setWeight(parsed.value);
                setUnit(parsed.unit);
              }
            }
          }
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            setError(`O'qish xatosi: ${(err as Error).message}`);
          }
        }
      };

      readLoop();
      void readableStreamClosed;
    } catch (err) {
      if ((err as Error).name !== 'NotFoundError') {
        setError(`Ulanish xatosi: ${(err as Error).message}`);
      }
    }
  }, [isSupported, settings, parseWeightLine]);

  const disconnect = useCallback(async () => {
    try {
      abortRef.current?.abort();
      readerRef.current?.cancel().catch(() => {});
      readerRef.current = null;
      await portRef.current?.close().catch(() => {});
      portRef.current = null;
    } catch { /* ignore */ }
    setConnected(false);
    setWeight(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  return {
    weight,
    unit,
    connected,
    error,
    isSupported,
    settings,
    updateSettings,
    connect,
    disconnect,
  };
}
