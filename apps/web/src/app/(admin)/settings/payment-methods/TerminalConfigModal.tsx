'use client';

import { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n-context';
import { UZ_BANKS, CARD_TYPES } from '@/types/payment-config';
import type { TerminalSettings } from '@/types/payment-config';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (settings: TerminalSettings) => void;
  initial?: TerminalSettings;
  isPending: boolean;
}

export default function TerminalConfigModal({ open, onClose, onSave, initial, isPending }: Props) {
  const { t } = useTranslation();
  const [bankName, setBankName] = useState(initial?.bankName ?? '');
  const [commissionRate, setCommissionRate] = useState(initial?.commissionRate ?? 1.0);
  const [cardTypes, setCardTypes] = useState<string[]>(initial?.cardTypes ?? ['UZCARD', 'HUMO']);
  const [terminalId, setTerminalId] = useState(initial?.terminalId ?? '');

  useEffect(() => {
    if (initial) {
      setBankName(initial.bankName ?? '');
      setCommissionRate(initial.commissionRate ?? 1.0);
      setCardTypes(Array.isArray(initial.cardTypes) ? initial.cardTypes : ['UZCARD', 'HUMO']);
      setTerminalId(initial.terminalId ?? '');
    }
  }, [initial]);

  const toggleCard = (card: string) => {
    setCardTypes((prev) => {
      const arr = Array.isArray(prev) ? prev : ['UZCARD', 'HUMO'];
      return arr.includes(card) ? arr.filter((c) => c !== card) : [...arr, card];
    });
  };

  const handleBankChange = (id: string) => {
    const bank = UZ_BANKS.find((b) => b.id === id);
    setBankName(bank?.name ?? id);
    if (bank) setCommissionRate(bank.commission);
  };

  const handleSave = () => {
    if (!bankName) return;
    onSave({ bankName, commissionRate, cardTypes, terminalId: terminalId || undefined });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">{t('paymentSettings.configureTerminal')}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Bank select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('paymentSettings.bank')}</label>
            <select
              value={UZ_BANKS.find((b) => b.name === bankName)?.id ?? 'other'}
              onChange={(e) => handleBankChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">{t('paymentSettings.selectBank')}</option>
              {UZ_BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id === 'other' ? t('common.other') : b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commission rate */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('paymentSettings.commission')}</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Terminal ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('paymentSettings.terminalId')} <span className="text-gray-400">({t('paymentSettings.terminalIdHint')})</span>
            </label>
            <input
              type="text"
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              placeholder="T-001"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Card types */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{t('paymentSettings.acceptedCards')}</label>
            <div className="flex flex-wrap gap-2">
              {CARD_TYPES.map((card) => (
                <button
                  key={card}
                  type="button"
                  onClick={() => toggleCard(card)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    (cardTypes ?? []).includes(card)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {card}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            disabled={!bankName || isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? t('paymentSettings.saving') : t('paymentSettings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
