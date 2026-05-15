'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n-context';
import type { PaymentProviderType } from '@/types/payment-config';

interface ProviderField {
  key: string;
  labelKey: string;
  type: 'text' | 'password';
  placeholder: string;
  hint: string;
}

const PROVIDER_FIELDS: Record<string, ProviderField[]> = {
  PAYME: [
    {
      key: 'merchantId',
      labelKey: 'paymentSettings.merchantId',
      type: 'text',
      placeholder: '5e730e8e0b852a417aa49ceb',
      hint: 'merchant.payme.uz → Sozlamalar → Merchant ID (24 belgi)',
    },
    {
      key: 'secretKey',
      labelKey: 'paymentSettings.secretKey',
      type: 'password',
      placeholder: 'xxxxxxxxxxxxxxxx',
      hint: 'merchant.payme.uz → Sozlamalar → Kalit (Secret Key)',
    },
  ],
  CLICK: [
    {
      key: 'serviceId',
      labelKey: 'paymentSettings.serviceId',
      type: 'text',
      placeholder: '12345',
      hint: 'merchant.click.uz → Xizmatlar → Service ID (raqam)',
    },
    {
      key: 'merchantId',
      labelKey: 'paymentSettings.merchantId',
      type: 'text',
      placeholder: '67890',
      hint: 'merchant.click.uz → Profil → Merchant ID (raqam)',
    },
    {
      key: 'secretKey',
      labelKey: 'paymentSettings.secretKey',
      type: 'password',
      placeholder: 'xxxxxxxxxxxxxxxx',
      hint: 'merchant.click.uz → Xizmatlar → Secret Key',
    },
  ],
};

const WEBHOOK_CONFIGS: Record<string, { label: string; path: string }[]> = {
  PAYME: [
    { label: 'Webhook URL', path: '/payments/webhooks/payme' },
  ],
  CLICK: [
    { label: 'Prepare URL', path: '/payments/webhooks/click/prepare' },
    { label: 'Complete URL', path: '/payments/webhooks/click/complete' },
  ],
};

const REGISTER_URLS: Record<string, string> = {
  PAYME: 'https://merchant.payme.uz',
  CLICK: 'https://merchant.click.uz',
};

interface Props {
  open: boolean;
  provider: PaymentProviderType;
  onClose: () => void;
  onSave: (credentials: Record<string, string>) => void;
  onVerify: () => void;
  hasCredentials: boolean;
  verifiedAt: string | null;
  isPending: boolean;
  isVerifying: boolean;
}

export default function OnlineProviderModal({
  open,
  provider,
  onClose,
  onSave,
  onVerify,
  hasCredentials,
  verifiedAt,
  isPending,
  isVerifying,
}: Props) {
  const { t } = useTranslation();
  const fields = PROVIDER_FIELDS[provider] ?? [];
  const webhookConfigs = WEBHOOK_CONFIGS[provider] ?? [];
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = '';
    setValues(initial);
  }, [provider]);

  const apiBase = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? `${window.location.origin}/api/v1`)
    : '';

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(t('paymentSettings.copySuccess'));
  };

  const allFilled = fields.every((f) => values[f.key]?.trim());

  const handleSave = () => {
    if (!allFilled) return;
    onSave(values);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{provider} — {t('paymentSettings.configure')}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Registration instructions */}
        {REGISTER_URLS[provider] && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-sm text-blue-800">
              <strong>1.</strong>{' '}
              <a
                href={REGISTER_URLS[provider]}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                {REGISTER_URLS[provider]}
              </a>{' '}
              {t('paymentSettings.registerHint')}
            </p>
            <p className="mt-1 text-sm text-blue-800">
              <strong>2.</strong> Olingan kalitlarni pastga kiriting
            </p>
            <p className="mt-1 text-sm text-blue-800">
              <strong>3.</strong> Webhook URL ni {provider} panelga kiriting
            </p>
          </div>
        )}

        {/* Warning about email */}
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Merchant ID — bu email <strong>EMAS</strong>. Bu {provider} merchant panelidan olinadigan
              maxsus ID raqam yoki kod.
            </p>
          </div>
        </div>

        {/* Credential fields */}
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t(f.labelKey)}</label>
              <input
                type={f.type}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-0.5 text-xs text-gray-400">{f.hint}</p>
            </div>
          ))}
        </div>

        {/* Webhook URLs */}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('paymentSettings.webhookUrl')}</label>
          {webhookConfigs.map((wh) => {
            const fullUrl = `${apiBase}${wh.path}`;
            return (
              <div key={wh.path}>
                {webhookConfigs.length > 1 && (
                  <p className="mb-1 text-xs font-medium text-gray-500">{wh.label}</p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullUrl}
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => copyUrl(fullUrl)}
                    className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                    title="Nusxalash"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-gray-400">{t('paymentSettings.webhookUrlHint')}</p>
        </div>

        {/* Verification status */}
        {hasCredentials && (
          <div className="mt-4 flex items-center gap-3">
            {verifiedAt ? (
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <ShieldCheck className="h-4 w-4" />
                <span>{t('paymentSettings.verified')}: {new Date(verifiedAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onVerify}
                disabled={isVerifying}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {isVerifying ? t('paymentSettings.verifying') : t('paymentSettings.verify')}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t('paymentSettings.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!allFilled || isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? t('paymentSettings.saving') : hasCredentials ? t('paymentSettings.update') : t('paymentSettings.connect')}
          </button>
        </div>
      </div>
    </div>
  );
}
