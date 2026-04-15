'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { X, Camera, Loader2 } from 'lucide-react';
import type { IScannerControls } from '@zxing/browser';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stableOnScan = useCallback(onScan, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          stableOnScan(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          setError(err.message ?? 'Skanerlashda xatolik');
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
        setIsLoading(false);
      })
      .catch((e: Error) => {
        setError(e?.message ?? 'Kamera ochilmadi. Brauzer ruxsatini tekshiring.');
        setIsLoading(false);
      });

    return () => {
      controlsRef.current?.stop();
    };
  }, [stableOnScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Barcode skanerlash</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video area */}
        <div className="relative bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          {/* Crosshair overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-24 border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 py-3 bg-red-50 text-sm text-red-600">{error}</div>
        )}

        <p className="px-5 py-3 text-xs text-center text-gray-400">
          Barcode kameraga to&apos;g&apos;ri ushlang
        </p>
      </div>
    </div>
  );
}
