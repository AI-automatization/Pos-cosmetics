'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { importApi } from '@/api/import.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

type PageState = 'idle' | 'uploading' | 'done';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
];
const ACCEPTED_EXTS = '.xlsx,.csv';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProductImportPage() {
  const [state, setState] = useState<PageState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const isValid =
      ACCEPTED_TYPES.includes(file.type) ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.csv');
    if (!isValid) {
      toast.error("Faqat XLSX yoki CSV fayllar qabul qilinadi");
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setState('idle');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [handleFileSelect],
  );

  const handleImport = async () => {
    if (!selectedFile) return;
    setState('uploading');
    try {
      const data = await importApi.uploadFile(selectedFile);
      // TODO(Task 9): replace with full async/polling UI — this bridge handles sync mode only
      if (data.mode !== 'sync') {
        setState('idle');
        toast.success('Import navbatga qo\'shildi, yuklanmoqda…');
        return;
      }
      setResult(data);
      setState('done');
      if (data.errors.length === 0) {
        toast.success(
          `Import muvaffaqiyatli: ${data.created} ta yaratildi, ${data.updated} ta yangilandi`,
        );
      } else {
        toast.warning(
          `Import tugadi: ${data.created} ta yaratildi, ${data.updated} ta yangilandi, ${data.errors.length} ta xato`,
        );
      }
    } catch {
      toast.error("Import amalga oshmadi. Fayl formatini tekshiring va qaytadan urinib ko'ring.");
      setState('idle');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setState('idle');
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await importApi.downloadTemplate();
      toast.success("Shablon yuklab olindi");
    } catch {
      toast.error("Shablonni yuklab olishda xato yuz berdi");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleExportXlsx = async () => {
    setExportingXlsx(true);
    try {
      await importApi.exportXlsx();
      toast.success("XLSX eksport boshlandi");
    } catch {
      toast.error("Eksport amalga oshmadi");
    } finally {
      setExportingXlsx(false);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await importApi.exportCsv();
      toast.success("CSV eksport boshlandi");
    } catch {
      toast.error("Eksport amalga oshmadi");
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Mahsulotlarni import qilish</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          CSV yoki XLSX fayl orqali mahsulotlarni ommaviy yuklang
        </p>
      </div>

      {/* Step 1: Template */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-50 p-3 shrink-0">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">1-qadam: Shablonni yuklab oling</p>
            <p className="mt-0.5 text-sm text-gray-500">
              To'g'ri ustunlar bilan tayyor XLSX shablon — namuna ma'lumotlar bilan birga
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className={cn(
                'mt-3 flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition',
                'hover:bg-blue-100 disabled:opacity-60',
              )}
            >
              <Download className="h-4 w-4" />
              {downloadingTemplate ? "Yuklanmoqda..." : "Shablonni yuklab oling"}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Upload */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-green-50 p-3 shrink-0">
            <Upload className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">2-qadam: Faylni yuklang</p>
            <p className="text-sm text-gray-500">XLSX yoki CSV formatda, maksimum 5 MB</p>
          </div>
        </div>

        {/* Drop zone */}
        {state !== 'done' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition',
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
            )}
          >
            <Upload
              className={cn('h-8 w-8', dragOver ? 'text-blue-500' : 'text-gray-400')}
            />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Faylni bu yerga tashlang yoki{' '}
                <span className="text-blue-600">tanlash uchun bosing</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">XLSX, CSV — maksimum 5 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTS}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Selected file info */}
        {selectedFile && state !== 'done' && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-green-600" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              aria-label="Faylni olib tashlash"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Import button */}
        {selectedFile && state !== 'done' && (
          <button
            type="button"
            onClick={handleImport}
            disabled={state === 'uploading'}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition',
              'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60',
            )}
          >
            {state === 'uploading' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Import qilinmoqda...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import qilish
              </>
            )}
          </button>
        )}
      </div>

      {/* Results */}
      {state === 'done' && result && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-4 font-semibold text-gray-900">Import natijalari</p>

          {/* Summary */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {result.created} ta yaratildi
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {result.updated} ta yangilandi
              </span>
            </div>
            {result.errors.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  {result.errors.length} ta xato
                </span>
              </div>
            )}
          </div>

          {/* Error list */}
          {result.errors.length > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-2 text-xs font-semibold text-red-700">Xatolar ro'yxati:</p>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Yana yuklash
          </button>
        </div>
      )}

      {/* Export section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-amber-50 p-3 shrink-0">
            <Download className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Mavjud mahsulotlarni eksport qilish</p>
            <p className="text-sm text-gray-500">
              Bazadagi barcha aktiv mahsulotlarni yuklab oling
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportXlsx}
            disabled={exportingXlsx}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition',
              'hover:bg-green-100 disabled:opacity-60',
            )}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exportingXlsx ? "Yuklanmoqda..." : "XLSX yuklab olish"}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition',
              'hover:bg-gray-100 disabled:opacity-60',
            )}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exportingCsv ? "Yuklanmoqda..." : "CSV yuklab olish"}
          </button>
        </div>
      </div>
    </div>
  );
}
