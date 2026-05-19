'use client';

import { RefreshCw, Usb, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useTranslation } from '@/i18n/i18n-context';
import type { PrinterSettings } from './types';

interface PrinterConnectionSettingsProps {
  settings: PrinterSettings;
  onUpdate: <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => void;
}

export function PrinterConnectionSettings({ settings, onUpdate }: PrinterConnectionSettingsProps) {
  const { t } = useTranslation();

  const COMMON_PRINTERS = [
    { value: 'epson-tm-t20', label: 'Epson TM-T20' },
    { value: 'epson-tm-t88', label: 'Epson TM-T88VI' },
    { value: 'xprinter-xp80', label: 'XPrinter XP-80' },
    { value: 'rongta-rp80', label: 'RONGTA RP80' },
    { value: 'custom', label: t('printer.otherModel') },
  ];

  const CONNECTION_OPTIONS = [
    { key: 'browser' as const, label: t('printer.browserPrint'), icon: RefreshCw, desc: t('printer.browserPrintDesc') },
    { key: 'usb' as const, label: t('printer.usbPrint'), icon: Usb, desc: t('printer.usbPrintDesc') },
    { key: 'network' as const, label: t('printer.networkPrint'), icon: Wifi, desc: t('printer.networkPrintDesc') },
  ];

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-gray-900">{t('printer.connection')}</h2>

      {/* Printer model */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('printer.printerModel')}</label>
        <SearchableDropdown
          options={COMMON_PRINTERS}
          value={settings.model}
          onChange={(val) => onUpdate('model', val)}
          placeholder={t('printer.selectModel')}
          searchable={false}
        />
      </div>

      {/* Connection type */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">{t('printer.connectionType')}</p>
        <div className="flex flex-col gap-2">
          {CONNECTION_OPTIONS.map((conn) => (
            <button
              key={conn.key}
              type="button"
              onClick={() => onUpdate('connection', conn.key)}
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
                <p className={cn('text-sm font-medium', settings.connection === conn.key ? 'text-blue-700' : 'text-gray-700')}>
                  {conn.label}
                </p>
                <p className="text-xs text-gray-400">{conn.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Network IP/Port */}
      {settings.connection === 'network' && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.ipAddress')}</label>
            <input
              type="text"
              value={settings.networkIp}
              onChange={(e) => onUpdate('networkIp', e.target.value)}
              placeholder="192.168.1.100"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs font-medium text-gray-600">{t('printer.port')}</label>
            <input
              type="text"
              value={settings.networkPort}
              onChange={(e) => onUpdate('networkPort', e.target.value)}
              placeholder="9100"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
