'use client';

import Link from 'next/link';
import { Plus, Send, Clock, CheckCircle, XCircle, FileText, MailIcon } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useCampaigns, useSendCampaign, useCancelCampaign } from '@/hooks/sms/useCampaigns';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';
import type { SmsCampaignStatus } from '@/types/sms';

const STATUS_ICON: Record<SmsCampaignStatus, typeof Send> = {
  DRAFT: FileText, SCHEDULED: Clock, SENDING: Send,
  SENT: CheckCircle, COMPLETED: CheckCircle, CANCELLED: XCircle,
};

const STATUS_CLASS: Record<SmsCampaignStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  SENDING: 'bg-yellow-100 text-yellow-700',
  SENT: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function CampaignsPage() {
  const { t } = useTranslation();
  const { data: campaigns, isLoading } = useCampaigns();
  const { mutate: sendNow, isPending: isSending } = useSendCampaign();
  const { mutate: cancel, isPending: isCancelling } = useCancelCampaign();

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('campaigns.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('campaigns.subtitle')}</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          {t('campaigns.new')}
        </Link>
      </div>

      {isLoading && <LoadingSkeleton variant="table" rows={5} />}

      {!isLoading && (!campaigns || campaigns.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MailIcon className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm text-gray-500">{t('campaigns.noCampaigns')}</p>
          <Link
            href="/campaigns/new"
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            {t('campaigns.new')}
          </Link>
        </div>
      )}

      {campaigns && campaigns.length > 0 && (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const Icon = STATUS_ICON[c.status];
            return (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition">
                <Link href={`/campaigns/${c.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_CLASS[c.status])}>
                      <Icon className="h-3 w-3" />
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 truncate">{c.content}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{t('campaigns.totalRecipients')}: {c.totalRecipients}</span>
                    <span>{t('campaigns.sent')}: {c.totalSent}</span>
                    <span>{t('campaigns.failed')}: {c.totalFailed}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  {c.status === 'DRAFT' && (
                    <button
                      type="button"
                      onClick={() => sendNow(c.id)}
                      disabled={isSending}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {t('campaigns.sendNow')}
                    </button>
                  )}
                  {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                    <button
                      type="button"
                      onClick={() => cancel(c.id)}
                      disabled={isCancelling}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      {t('campaigns.cancel')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
