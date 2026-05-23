'use client';

import { useState, useEffect } from 'react';
import { Printer, Check, RefreshCw, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { PrinterGeneralSettings } from './_components/PrinterGeneralSettings';
import { PrinterConnectionSettings } from './_components/PrinterConnectionSettings';
import type { PrinterSettings } from './_components/types';
import { DEFAULT_PRINTER_SETTINGS } from './_components/types';

// Printer settings stored in localStorage
const LS_KEY = 'raos_printer_settings';
const DEFAULT_SETTINGS: PrinterSettings = DEFAULT_PRINTER_SETTINGS;

function buildTestReceiptHtml(paperWidth: '58' | '80') {
  const w = paperWidth === '58' ? '48mm' : '72mm';
  const fs = paperWidth === '58' ? '10px' : '12px';
  const now = new Date().toLocaleString();
  return `<html>
<head>
<style>
  @page { size: ${paperWidth}mm auto; margin: 0; }
  body { font-family: 'Courier New', monospace; font-size: ${fs}; width: ${w}; margin: 4mm auto; color: #000; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 4px 0; }
  .row { display: flex; justify-content: space-between; }
  .small { font-size: ${paperWidth === '58' ? '8px' : '10px'}; color: #444; }
</style>
</head>
<body>
  <div class="center bold" style="font-size:${paperWidth === '58' ? '12px' : '14px'}">RAOS POS</div>
  <div class="center">Test receipt (${paperWidth}mm)</div>
  <div class="center small">Printer connection test</div>
  <div class="line"></div>
  <div class="row"><span>Product A x 2</span><span>20,000</span></div>
  <div class="row"><span>Product B x 1</span><span>15,000</span></div>
  <div class="row"><span>Product C x 3</span><span>45,000</span></div>
  <div class="line"></div>
  <div class="row bold"><span>TOTAL:</span><span>80,000</span></div>
  <div class="line"></div>
  <div class="row small"><span>Cash:</span><span>100,000</span></div>
  <div class="row small bold"><span>Change:</span><span>20,000</span></div>
  <div class="line"></div>
  <div class="center small">Thank you!</div>
  <div class="center" style="font-size:9px;margin-top:4px">${now}</div>
  <div class="center" style="font-size:8px;margin-top:2px;color:#888">RAOS - raos.uz</div>
</body>
</html>`;
}

function testPrint(paperWidth: '58' | '80', copies: number) {
  for (let i = 0; i < copies; i++) {
    setTimeout(() => {
      const win = window.open('', '_blank', 'width=400,height=600');
      if (!win) return;
      win.document.write(buildTestReceiptHtml(paperWidth));
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }, i * 800);
  }
}

export default function PrinterSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PrinterSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const handleSave = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    testPrint(settings.paperWidth, settings.copies);
    setTimeout(() => setTesting(false), 1500);
  };

  const update = <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Printer className="h-5 w-5 text-gray-600" />
            {t('printer.title')}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('printer.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', testing && 'animate-spin')} />
            {testing ? t('printer.printing') : t('printer.testPrint')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition',
              saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            {saved ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            {saved ? t('printer.saved') : t('printer.save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PrinterGeneralSettings settings={settings} onUpdate={update} />
        <PrinterConnectionSettings settings={settings} onUpdate={update} />
      </div>

      {/* T-330: Receipt customization */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">{t('printer.headerFooter')}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.storeName')}</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => update('storeName', e.target.value)}
              placeholder={t('printer.storeNamePlaceholder')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.inn')}</label>
            <input
              type="text"
              value={settings.inn}
              onChange={(e) => update('inn', e.target.value)}
              placeholder="123456789"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.address')}</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder={t('printer.addressPlaceholder')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.footerText')}</label>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => update('footerText', e.target.value)}
              placeholder={t('printer.defaultFooter')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Supported printers info */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t('printer.supportedPrinters')}
        </p>
        <div className="flex flex-wrap gap-2">
          {['Epson TM-T20', 'Epson TM-T88VI', 'XPrinter XP-80', 'RONGTA RP80', 'XPrinter N160II'].map((m) => (
            <span key={m} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
              {m}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">{t('printer.mvpNote')}</p>
      </div>
    </div>
  );
}
