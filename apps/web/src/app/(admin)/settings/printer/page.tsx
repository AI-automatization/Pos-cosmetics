'use client';

import { useState, useEffect } from 'react';
import { Printer, Check, RefreshCw, Wifi, Usb, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useTranslation } from '@/i18n/i18n-context';

// Printer settings stored in localStorage
const LS_KEY = 'raos_printer_settings';

interface PrinterSettings {
  enabled: boolean;
  autoPrint: boolean;
  model: string;
  connection: 'usb' | 'network' | 'browser';
  networkIp: string;
  networkPort: string;
  paperWidth: '58' | '80';
  copies: number;
  openDrawerOnCash: boolean;
  // T-330: Receipt customization
  storeName: string;
  inn: string;
  address: string;
  footerText: string;
}

const DEFAULT_SETTINGS: PrinterSettings = {
  enabled: true,
  autoPrint: false,
  model: '',
  connection: 'browser',
  networkIp: '',
  networkPort: '9100',
  paperWidth: '80',
  copies: 1,
  openDrawerOnCash: false,
  storeName: '',
  inn: '',
  address: '',
  footerText: '',
};

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

  const COMMON_PRINTERS = [
    { value: 'epson-tm-t20', label: 'Epson TM-T20' },
    { value: 'epson-tm-t88', label: 'Epson TM-T88VI' },
    { value: 'xprinter-xp80', label: 'XPrinter XP-80' },
    { value: 'rongta-rp80', label: 'RONGTA RP80' },
    { value: 'custom', label: t('printer.otherModel') },
  ];

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
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Printer className="h-5 w-5 text-gray-600" />
            {t('printer.title')}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {t('printer.subtitle')}
          </p>
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

      <div className="grid grid-cols-2 gap-6">
        {/* General settings */}
        <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">{t('printer.basicSettings')}</h2>

          {/* Enable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('printer.enablePrinter')}</p>
              <p className="text-xs text-gray-400">{t('printer.enablePrinterDesc')}</p>
            </div>
            <button
              type="button"
              onClick={() => update('enabled', !settings.enabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition',
                settings.enabled ? 'bg-blue-600' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.enabled ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          {/* Auto-print */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('printer.autoPrint')}</p>
              <p className="text-xs text-gray-400">{t('printer.autoPrintDesc')}</p>
            </div>
            <button
              type="button"
              onClick={() => update('autoPrint', !settings.autoPrint)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition',
                settings.autoPrint ? 'bg-blue-600' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.autoPrint ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          {/* Cash drawer */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('printer.openCashDrawer')}</p>
              <p className="text-xs text-gray-400">{t('printer.openCashDrawerDesc')}</p>
            </div>
            <button
              type="button"
              onClick={() => update('openDrawerOnCash', !settings.openDrawerOnCash)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition',
                settings.openDrawerOnCash ? 'bg-blue-600' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.openDrawerOnCash ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          {/* Paper width */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{t('printer.paperWidth')}</p>
            <div className="flex gap-2">
              {(['58', '80'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => update('paperWidth', w)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition',
                    settings.paperWidth === w
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {w}mm
                </button>
              ))}
            </div>
          </div>

          {/* Copies */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{t('printer.copies')}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update('copies', Math.max(1, settings.copies - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{settings.copies}</span>
              <button
                type="button"
                onClick={() => update('copies', Math.min(3, settings.copies + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Connection settings */}
        <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">{t('printer.connection')}</h2>

          {/* Printer model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('printer.printerModel')}</label>
            <SearchableDropdown
              options={COMMON_PRINTERS}
              value={settings.model}
              onChange={(val) => update('model', val)}
              placeholder={t('printer.selectModel')}
              searchable={false}
            />
          </div>

          {/* Connection type */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{t('printer.connectionType')}</p>
            <div className="flex flex-col gap-2">
              {([
                { key: 'browser', label: t('printer.browserPrint'), icon: RefreshCw, desc: t('printer.browserPrintDesc') },
                { key: 'usb', label: t('printer.usbPrint'), icon: Usb, desc: t('printer.usbPrintDesc') },
                { key: 'network', label: t('printer.networkPrint'), icon: Wifi, desc: t('printer.networkPrintDesc') },
              ] as const).map((conn) => (
                <button
                  key={conn.key}
                  type="button"
                  onClick={() => update('connection', conn.key)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                    settings.connection === conn.key
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <conn.icon
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      settings.connection === conn.key ? 'text-blue-600' : 'text-gray-400',
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        settings.connection === conn.key ? 'text-blue-700' : 'text-gray-700',
                      )}
                    >
                      {conn.label}
                    </p>
                    <p className="text-xs text-gray-400">{conn.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Network IP/Port (only when network selected) */}
          {settings.connection === 'network' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.ipAddress')}</label>
                <input
                  type="text"
                  value={settings.networkIp}
                  onChange={(e) => update('networkIp', e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.port')}</label>
                <input
                  type="text"
                  value={settings.networkPort}
                  onChange={(e) => update('networkPort', e.target.value)}
                  placeholder="9100"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}
        </div>
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
        <p className="mt-3 text-xs text-gray-400">
          {t('printer.mvpNote')}
        </p>
      </div>
    </div>
  );
}
