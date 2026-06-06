'use client';

import { useState } from 'react';
import {
  Banknote,
  Building2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import {
  usePaymentConfigs,
  useUpsertProvider,
  useDeactivateProvider,
  useVerifyProvider,
} from '@/hooks/settings/usePaymentConfig';
import { useTranslation } from '@/i18n/i18n-context';
import type { PaymentProviderType, TerminalSettings, ProviderConfigSummary } from '@/types/payment-config';
import TerminalConfigModal from './TerminalConfigModal';
import OnlineProviderModal from './OnlineProviderModal';

interface ProviderDef {
  provider: PaymentProviderType | 'CASH';
  labelKey: string;
  descKey: string;
  icon: React.ReactNode;
  type: 'always' | 'terminal' | 'online' | 'coming_soon';
}

const PROVIDER_DEFS: ProviderDef[] = [
  { provider: 'CASH', labelKey: 'paymentSettings.cash', descKey: 'paymentSettings.cashDesc', icon: <Banknote className="h-6 w-6 text-green-600" />, type: 'always' },
  { provider: 'TERMINAL', labelKey: 'paymentSettings.terminal', descKey: 'paymentSettings.terminalDesc', icon: <Building2 className="h-6 w-6 text-blue-600" />, type: 'terminal' },
  { provider: 'PAYME', labelKey: 'paymentSettings.payme', descKey: 'paymentSettings.paymeDesc', icon: <CreditCard className="h-6 w-6 text-cyan-600" />, type: 'online' },
  { provider: 'CLICK', labelKey: 'paymentSettings.click', descKey: 'paymentSettings.clickDesc', icon: <Smartphone className="h-6 w-6 text-blue-500" />, type: 'online' },
  { provider: 'UZUM', labelKey: 'paymentSettings.uzum', descKey: 'paymentSettings.uzumDesc', icon: <CreditCard className="h-6 w-6 text-purple-500" />, type: 'coming_soon' },
];

function getConfig(configs: ProviderConfigSummary[] | undefined, provider: string): ProviderConfigSummary | undefined {
  return configs?.find((c) => c.provider === provider);
}

export default function PaymentMethodsPage() {
  const { t } = useTranslation();
  const { data: configs, isLoading } = usePaymentConfigs();
  const upsertMutation = useUpsertProvider();
  const deactivateMutation = useDeactivateProvider();
  const verifyMutation = useVerifyProvider();

  const [terminalModal, setTerminalModal] = useState(false);
  const [onlineModal, setOnlineModal] = useState<PaymentProviderType | null>(null);

  const handleTerminalSave = (settings: TerminalSettings) => {
    upsertMutation.mutate(
      { provider: 'TERMINAL', payload: { settings: { ...settings } as Record<string, unknown>, isActive: true } },
      { onSuccess: () => setTerminalModal(false) },
    );
  };

  const handleOnlineSave = (provider: PaymentProviderType, credentials: Record<string, string>) => {
    upsertMutation.mutate(
      { provider, payload: { credentials, isActive: true } },
      { onSuccess: () => setOnlineModal(null) },
    );
  };

  const handleToggle = (provider: PaymentProviderType, currentlyActive: boolean) => {
    if (currentlyActive) {
      deactivateMutation.mutate(provider);
    } else {
      upsertMutation.mutate({ provider, payload: { isActive: true } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('paymentSettings.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('paymentSettings.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {PROVIDER_DEFS.map((p) => {
          const config = p.provider !== 'CASH' ? getConfig(configs, p.provider) : undefined;
          const isActive = p.type === 'always' || (config?.isActive ?? false);
          const hasCredentials = config?.hasCredentials ?? false;

          return (
            <div
              key={p.provider}
              className={`rounded-xl border p-5 transition ${
                isActive ? 'border-green-200 bg-white' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{p.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t(p.labelKey)}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{t(p.descKey)}</p>

                    {/* Terminal settings summary */}
                    {p.provider === 'TERMINAL' && config?.isActive && (() => {
                      // Narrowing from API-stored settings to known TerminalSettings shape
                      const ts = config.settings as unknown as TerminalSettings;
                      return (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ts.bankName && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                              {ts.bankName}
                            </span>
                          )}
                          {ts.commissionRate !== undefined && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                              Komissiya: {ts.commissionRate}%
                            </span>
                          )}
                          {Array.isArray(ts.cardTypes) &&
                            ts.cardTypes.map((ct) => (
                              <span
                                key={ct}
                                className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700"
                              >
                                {ct}
                              </span>
                            ))}
                        </div>
                      );
                    })()}

                    {/* Online provider status */}
                    {p.type === 'online' && config && (
                      <div className="mt-2 flex items-center gap-2">
                        {hasCredentials && config.verifiedAt ? (
                          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <ShieldCheck className="h-3 w-3" /> {t('paymentSettings.verified')}: {new Date(config.verifiedAt).toLocaleDateString()}
                          </span>
                        ) : hasCredentials ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
                            Credentials kiritilgan — tekshirilmagan
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">
                            {t('paymentSettings.notConnected')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {p.type === 'always' && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {t('paymentSettings.always')}
                    </span>
                  )}

                  {p.type === 'coming_soon' && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">{t('paymentSettings.comingSoon')}</span>
                  )}

                  {(p.type === 'terminal' || p.type === 'online') && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (p.type === 'terminal') setTerminalModal(true);
                          else setOnlineModal(p.provider as PaymentProviderType);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        {t('paymentSettings.configure')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(p.provider as PaymentProviderType, isActive)}
                        disabled={deactivateMutation.isPending || upsertMutation.isPending}
                        className="text-gray-400 hover:text-gray-600"
                        title={isActive ? t('paymentSettings.disable') : t('paymentSettings.enable')}
                      >
                        {isActive ? (
                          <ToggleRight className="h-7 w-7 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-7 w-7" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Modal */}
      <TerminalConfigModal
        open={terminalModal}
        onClose={() => setTerminalModal(false)}
        onSave={handleTerminalSave}
        initial={(() => {
          const s = getConfig(configs, 'TERMINAL')?.settings;
          if (!s || !('bankName' in s) || !s.bankName) return undefined;
          return {
            bankName: s.bankName as string,
            commissionRate: Number(s.commissionRate ?? 1.0),
            cardTypes: Array.isArray(s.cardTypes) ? s.cardTypes as string[] : ['UZCARD', 'HUMO'],
            terminalId: (s.terminalId as string) ?? undefined,
          };
        })()}
        isPending={upsertMutation.isPending}
      />

      {/* Online Provider Modal (Payme / Click) */}
      {onlineModal && (
        <OnlineProviderModal
          open={!!onlineModal}
          provider={onlineModal}
          onClose={() => setOnlineModal(null)}
          onSave={(creds) => handleOnlineSave(onlineModal, creds)}
          onVerify={() => verifyMutation.mutate(onlineModal)}
          hasCredentials={getConfig(configs, onlineModal)?.hasCredentials ?? false}
          verifiedAt={getConfig(configs, onlineModal)?.verifiedAt ?? null}
          isPending={upsertMutation.isPending}
          isVerifying={verifyMutation.isPending}
        />
      )}
    </div>
  );
}
