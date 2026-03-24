'use client';

import { useState, useEffect } from 'react';
import { Printer, Check, RefreshCw, Wifi, Usb, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
};

const COMMON_PRINTERS = [
  { value: 'epson-tm-t20', label: 'Epson TM-T20' },
  { value: 'epson-tm-t88', label: 'Epson TM-T88VI' },
  { value: 'xprinter-xp80', label: 'XPrinter XP-80' },
  { value: 'rongta-rp80', label: 'RONGTA RP80' },
  { value: 'custom', label: 'Boshqa...' },
];

function buildTestReceiptHtml(paperWidth: '58' | '80') {
  const w = paperWidth === '58' ? '48mm' : '72mm';
  const fs = paperWidth === '58' ? '10px' : '12px';
  const now = new Date().toLocaleString('uz-UZ');
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
  <div class="center">Test cheki (${paperWidth}mm)</div>
  <div class="center small">Printer ulanishini tekshirish</div>
  <div class="line"></div>
  <div class="row"><span>Mahsulot A × 2</span><span>20,000</span></div>
  <div class="row"><span>Mahsulot B × 1</span><span>15,000</span></div>
  <div class="row"><span>Mahsulot C × 3</span><span>45,000</span></div>
  <div class="line"></div>
  <div class="row bold"><span>JAMI:</span><span>80,000 so'm</span></div>
  <div class="line"></div>
  <div class="row small"><span>Naqd pul:</span><span>100,000</span></div>
  <div class="row small bold"><span>Qaytim:</span><span>20,000</span></div>
  <div class="line"></div>
  <div class="center small">Xarid uchun rahmat!</div>
  <div class="center" style="font-size:9px;margin-top:4px">${now}</div>
  <div class="center" style="font-size:8px;margin-top:2px;color:#888">RAOS · raos.uz</div>
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
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Printer className="h-5 w-5 text-gray-600" />
            Thermal Printer sozlamalari
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            80mm yoki 58mm chek printer konfiguratsiyasi
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
            {testing ? 'Chiqarilmoqda...' : 'Test chek'}
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
            {saved ? 'Saqlandi!' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General settings */}
        <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Asosiy sozlamalar</h2>

          {/* Enable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Printerni yoqish</p>
              <p className="text-xs text-gray-400">Chek chiqarish funksiyasi</p>
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
              <p className="text-sm font-medium text-gray-700">Auto-print</p>
              <p className="text-xs text-gray-400">Sotuv tugaganda avtomatik chiqarish</p>
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
              <p className="text-sm font-medium text-gray-700">Kassa qutisini ochish</p>
              <p className="text-xs text-gray-400">Naqd to'lovda avtomatik ochish</p>
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
            <p className="mb-2 text-sm font-medium text-gray-700">Qog'oz kengligi</p>
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
            <p className="mb-2 text-sm font-medium text-gray-700">Nusxa soni</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update('copies', Math.max(1, settings.copies - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                −
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
          <h2 className="font-semibold text-gray-900">Ulanish</h2>

          {/* Printer model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Printer modeli</label>
            <select
              value={settings.model}
              onChange={(e) => update('model', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">— Tanlang —</option>
              {COMMON_PRINTERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Connection type */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Ulanish turi</p>
            <div className="flex flex-col gap-2">
              {([
                { key: 'browser', label: 'Browser Print (window.print)', icon: RefreshCw, desc: 'Oddiy, hamma brauzerlarda ishlaydi' },
                { key: 'usb', label: 'USB (WebUSB API)', icon: Usb, desc: 'Tauri desktop ilovada to\'liq ishlaydi' },
                { key: 'network', label: 'Network (TCP/IP)', icon: Wifi, desc: 'Tarmoq orqali, IP va port kerak' },
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
                <label className="mb-1 block text-xs font-medium text-gray-600">IP manzil</label>
                <input
                  type="text"
                  value={settings.networkIp}
                  onChange={(e) => update('networkIp', e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs font-medium text-gray-600">Port</label>
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

      {/* Supported printers info */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Qo'llab-quvvatlanadigan printerlar
        </p>
        <div className="flex flex-wrap gap-2">
          {['Epson TM-T20', 'Epson TM-T88VI', 'XPrinter XP-80', 'RONGTA RP80', 'XPrinter N160II'].map((m) => (
            <span key={m} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
              {m}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          💡 MVP rejimida <strong>Browser Print</strong> (window.print) ishlatiladi.
          Tauri desktop ilovada ESC/POS binary commands orqali to'liq ishlaydi.
        </p>
      </div>
    </div>
  );
}
