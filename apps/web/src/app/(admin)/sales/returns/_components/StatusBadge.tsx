'use client';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n-context';
import { RETURN_STATUS_KEYS, type ReturnStatus } from '@/types/returns';

export function StatusBadge({ status }: { status: ReturnStatus }) {
  const { t } = useTranslation();
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle className="h-3 w-3" />
        {t(RETURN_STATUS_KEYS.APPROVED)}
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        <Clock className="h-3 w-3" />
        {t(RETURN_STATUS_KEYS.PENDING)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      <AlertCircle className="h-3 w-3" />
      {t(RETURN_STATUS_KEYS.REJECTED)}
    </span>
  );
}
