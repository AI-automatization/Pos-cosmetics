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
import type { PaymentProviderType, TerminalSettings, ProviderConfigSummary } from '@/types/payment-config';
import TerminalConfigModal from './TerminalConfigModal';
import OnlineProviderModal from './OnlineProviderModal';

interface ProviderCardDef {
  provider: PaymentProviderType | 'CASH';
  label: string;
  description: string;
  icon: React.ReactNode;
  type: 'always' | 'terminal' | 'online' | 'coming_soon';
}

const PROVIDERS: ProviderCardDef[] = [
  {
    provider: 'CASH',
    label: 'Naqd pul',
    description: "Naqd pul bilan to'lov har doim mavjud",
    icon: <Banknote className="h-6 w-6 text-green-600" />,
    type: 'always',
  },
  {
    provider: 'TERMINAL',
    label: 'Bank terminali',
    description: "Uzcard, Humo, Visa, MasterCard — bank terminali orqali",
    icon: <Building2 className="h-6 w-6 text-blue-600" />,
    type: 'terminal',
  },
  {
    provider: 'PAYME',
    label: 'Payme',
    description: "Payme onlayn to'lov tizimi",
    icon: <CreditCard className="h-6 w-6 text-cyan-600" />,
    type: 'online',
  },
  {
    provider: 'CLICK',
    label: 'Click',
    description: "Click onlayn to'lov tizimi",
    icon: <Smartphone className="h-6 w-6 text-blue-500" />,
    type: 'online',
  },
  {
    provider: 'UZUM',
    label: 'Uzum Bank',
    description: "Uzum onlayn to'lov tizimi",
    icon: <CreditCard className="h-6 w-6 text-purple-500" />,
    type: 'coming_soon',
  },
];

function getConfig(configs: ProviderConfigSummary[] | undefined, provider: string): ProviderConfigSummary | undefined {
  return configs?.find((c) => c.provider === provider);
}

export default function PaymentMethodsPage() {
  const { data: configs, isLoading } = usePaymentConfigs();
  const upsertMutation = useUpsertProvider();
  const deactivateMutation = useDeactivateProvider();
  const verifyMutation = useVerifyProvider();

  const [terminalModal, setTerminalModal] = useState(false);
  const [onlineModal, setOnlineModal] = useState<PaymentProviderType | null>(null);

  const handleTerminalSave = (settings: TerminalSettings) => {
    upsertMutation.mutate(
      { provider: 'TERMINAL', payload: { settings: settings as unknown as Record<string, unknown>, isActive: true } },
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
        <h1 className="text-2xl font-bold text-gray-900">To&apos;lov usullari</h1>
        <p className="mt-1 text-sm text-gray-500">
          To&apos;lov provayderlarini sozlang — POS kassada faqat faol provayderlar ko&apos;rinadi
        </p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((p) => {
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
                    <h3 className="font-semibold text-gray-900">{p.label}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{p.description}</p>

                    {/* Terminal settings summary */}
                    {p.provider === 'TERMINAL' && config?.isActive && (() => {
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
                        {hasCredentials ? (
                          <>
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              <ShieldCheck className="h-3 w-3" /> Ulangan
                            </span>
                            {config.verifiedAt && (
                              <span className="text-xs text-gray-400">
                                Tekshirilgan: {new Date(config.verifiedAt).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
                            Ulanmagan
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
                      Har doim
                    </span>
                  )}

                  {p.type === 'coming_soon' && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">Tez kunda</span>
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
                        Sozlash
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(p.provider as PaymentProviderType, isActive)}
                        disabled={deactivateMutation.isPending || upsertMutation.isPending}
                        className="text-gray-400 hover:text-gray-600"
                        title={isActive ? "O'chirish" : 'Yoqish'}
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
        initial={
          getConfig(configs, 'TERMINAL')?.settings
            ? (getConfig(configs, 'TERMINAL')!.settings as unknown as TerminalSettings)
            : undefined
        }
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
