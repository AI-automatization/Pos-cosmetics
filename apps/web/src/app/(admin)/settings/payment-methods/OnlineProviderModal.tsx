'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentProviderType } from '@/types/payment-config';

interface ProviderField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
}

const PROVIDER_FIELDS: Record<string, ProviderField[]> = {
  PAYME: [
    { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Payme merchant ID' },
    { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Payme secret key' },
  ],
  CLICK: [
    { key: 'serviceId', label: 'Service ID', type: 'text', placeholder: 'Click service ID' },
    { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Click merchant ID' },
    { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Click secret key' },
  ],
};

const WEBHOOK_URLS: Record<string, string> = {
  PAYME: '/payments/webhooks/payme',
  CLICK: '/payments/webhooks/click/prepare',
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
  const fields = PROVIDER_FIELDS[provider] ?? [];
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = '';
    setValues(initial);
  }, [provider]);

  const apiBase = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? `${window.location.origin}/api/v1`)
    : '';
  const webhookUrl = `${apiBase}${WEBHOOK_URLS[provider] ?? ''}`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL nusxalandi');
  };

  const allFilled = fields.every((f) => values[f.key]?.trim());

  const handleSave = () => {
    if (!allFilled) return;
    onSave(values);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{provider} sozlash</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Registration link */}
        {REGISTER_URLS[provider] && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-sm text-blue-800">
              Avval{' '}
              <a
                href={REGISTER_URLS[provider]}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                {REGISTER_URLS[provider]}
              </a>{' '}
              da ro&apos;yxatdan o&apos;ting va merchant credentials oling.
            </p>
          </div>
        )}

        {/* Credential fields */}
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
              <input
                type={f.type}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Webhook URL */}
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Webhook URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
            <button
              type="button"
              onClick={copyWebhookUrl}
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
              title="Nusxalash"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Bu URL ni {provider} merchant panelida webhook sifatida kiriting
          </p>
        </div>

        {/* Verification status */}
        {hasCredentials && (
          <div className="mt-4 flex items-center gap-3">
            {verifiedAt ? (
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <ShieldCheck className="h-4 w-4" />
                <span>Tekshirilgan: {new Date(verifiedAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onVerify}
                disabled={isVerifying}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {isVerifying ? 'Tekshirilmoqda...' : 'Tekshirish'}
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
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!allFilled || isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saqlanmoqda...' : hasCredentials ? 'Yangilash' : 'Ulash'}
          </button>
        </div>
      </div>
    </div>
  );
}
