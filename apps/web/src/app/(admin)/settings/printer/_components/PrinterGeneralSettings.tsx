'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { PrinterSettings } from './types';

interface PrinterGeneralSettingsProps {
  settings: PrinterSettings;
  onUpdate: <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => void;
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          value ? 'bg-blue-600' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            value ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

export function PrinterGeneralSettings({ settings, onUpdate }: PrinterGeneralSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-gray-900">{t('printer.basicSettings')}</h2>

      <ToggleRow
        label={t('printer.enablePrinter')}
        description={t('printer.enablePrinterDesc')}
        value={settings.enabled}
        onChange={() => onUpdate('enabled', !settings.enabled)}
      />

      <ToggleRow
        label={t('printer.autoPrint')}
        description={t('printer.autoPrintDesc')}
        value={settings.autoPrint}
        onChange={() => onUpdate('autoPrint', !settings.autoPrint)}
      />

      <ToggleRow
        label={t('printer.openCashDrawer')}
        description={t('printer.openCashDrawerDesc')}
        value={settings.openDrawerOnCash}
        onChange={() => onUpdate('openDrawerOnCash', !settings.openDrawerOnCash)}
      />

      {/* Paper width */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">{t('printer.paperWidth')}</p>
        <div className="flex gap-2">
          {(['58', '80'] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onUpdate('paperWidth', w)}
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
            onClick={() => onUpdate('copies', Math.max(1, settings.copies - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            -
          </button>
          <span className="w-8 text-center font-semibold text-gray-900">{settings.copies}</span>
          <button
            type="button"
            onClick={() => onUpdate('copies', Math.min(3, settings.copies + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
