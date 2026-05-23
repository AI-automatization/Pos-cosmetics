'use client';

import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

interface PromoResult {
  valid: boolean;
  discount: number;
  type: 'PERCENT' | 'FIXED';
  message: string;
}

interface PromoCodeInputProps {
  subtotal: number;
  onApply: (discount: number) => void;
  onClear: () => void;
}

export function PromoCodeInput({ subtotal, onApply, onClear }: PromoCodeInputProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoResult | null>(null);

  async function handleValidate() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.post<PromoResult>('/promotions/codes/validate', {
        code: code.trim().toUpperCase(),
        purchaseAmount: subtotal,
      });
      setResult(res.data);
      if (res.data.valid) {
        const discount = res.data.type === 'PERCENT'
          ? Math.round(subtotal * res.data.discount / 100)
          : res.data.discount;
        onApply(discount);
      }
    } catch {
      setResult({ valid: false, discount: 0, type: 'FIXED', message: 'Kod topilmadi' });
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setCode('');
    setResult(null);
    onClear();
  }

  if (result?.valid) {
    const discountAmount = result.type === 'PERCENT'
      ? Math.round(subtotal * result.discount / 100)
      : result.discount;
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
        <Tag className="h-4 w-4 text-green-600" />
        <span className="text-sm font-mono font-bold text-green-700">{code.toUpperCase()}</span>
        <span className="text-xs text-green-600">-{formatPrice(discountAmount)}</span>
        <button type="button" onClick={handleClear} className="ml-auto text-gray-400 hover:text-red-500">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <div className="relative flex-1">
        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleValidate(); }}
          placeholder={t('promo.code') || 'RAOS-XXXX'}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-xs font-mono uppercase outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
        />
      </div>
      <button
        type="button"
        onClick={handleValidate}
        disabled={!code.trim() || loading}
        className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-600 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </button>
      {result && !result.valid && (
        <span className="self-center text-xs text-red-500">{result.message}</span>
      )}
    </div>
  );
}
