'use client';

import { X, Upload, ImageIcon } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;

      setUploading(true);
      try {
        const localUrl = URL.createObjectURL(file);
        onChange(localUrl);
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="col-span-2">
      <label className="mb-1 block text-sm font-medium text-gray-700">Rasm</label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Mahsulot rasmi"
            className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-md transition hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed py-6 text-sm transition',
            dragging
              ? 'border-blue-400 bg-blue-50 text-blue-600'
              : 'border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500',
          )}
        >
          {uploading ? (
            <span className="text-blue-500">Yuklanmoqda...</span>
          ) : (
            <>
              {dragging ? (
                <Upload className="h-8 w-8" />
              ) : (
                <ImageIcon className="h-8 w-8" />
              )}
              <span>Rasm tashlang yoki bosing</span>
              <span className="text-xs text-gray-300">PNG, JPG — max 5MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
