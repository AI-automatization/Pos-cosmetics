'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useCampaign, useCampaignMessages, useSendCampaign, useCancelCampaign } from '@/hooks/sms/useCampaigns';
import { useTranslation } from '@/i18n/i18n-context';
import { formatPrice, cn } from '@/lib/utils';
import type { SmsMessageStatus } from '@/types/sms';

const MSG_STATUS_CLASS: Record<SmsMessageStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  QUEUED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
  UNSUBSCRIBED: 'bg-orange-100 text-orange-700',
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { data: campaign, isLoading } = useCampaign(id);
  const { data: messages } = useCampaignMessages(id);
  const { mutate: sendNow, isPending: isSending } = useSendCampaign();
  const { mutate: cancel, isPending: isCancelling } = useCancelCampaign();

  if (isLoading) return <PageLayout><LoadingSkeleton variant="table" rows={6} /></PageLayout>;
  if (!campaign) return <PageLayout><p className="text-sm text-gray-500">Campaign not found</p></PageLayout>;

  const costSom = campaign.totalCost / 100;

  return (
    <PageLayout>
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        {t('campaigns.back')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{campaign.content}</p>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'DRAFT' && (
            <button onClick={() => sendNow(id)} disabled={isSending}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition">
              <Send className="h-4 w-4" /> {t('campaigns.sendNow')}
            </button>
          )}
          {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
            <button onClick={() => cancel(id)} disabled={isCancelling}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition">
              {t('campaigns.cancel')}
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Send} label={t('campaigns.totalRecipients')} value={campaign.totalRecipients} />
        <StatCard icon={CheckCircle} label={t('campaigns.sent')} value={campaign.totalSent} accent="green" />
        <StatCard icon={XCircle} label={t('campaigns.failed')} value={campaign.totalFailed} accent="red" />
        <StatCard icon={Clock} label={t('campaigns.cost')} value={`${formatPrice(costSom)}`} />
      </div>

      {/* Schedule info */}
      {campaign.scheduledAt && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('campaigns.scheduledAt')}: {new Date(campaign.scheduledAt).toLocaleString()}
        </div>
      )}

      {/* Messages table */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('campaigns.messages')}</h2>
      {(!messages || messages.length === 0) ? (
        <p className="text-sm text-gray-400 text-center py-8">{t('campaigns.noMessages')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">{t('campaigns.phone')}</th>
                <th className="px-4 py-2 text-left font-medium">{t('campaigns.statusLabel')}</th>
                <th className="px-4 py-2 text-left font-medium">{t('campaigns.cost')}</th>
                <th className="px-4 py-2 text-left font-medium">{t('campaigns.errorMessage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-800">{m.phone}</td>
                  <td className="px-4 py-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', MSG_STATUS_CLASS[m.status])}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{formatPrice(m.costInTiyin / 100)}</td>
                  <td className="px-4 py-2 text-gray-400 text-xs">{m.errorMessage ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: typeof Send;
  label: string;
  value: string | number;
  accent?: 'green' | 'red';
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', accent === 'green' ? 'text-green-500' : accent === 'red' ? 'text-red-500' : 'text-gray-400')} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={cn('text-lg font-semibold', accent === 'green' ? 'text-green-700' : accent === 'red' ? 'text-red-600' : 'text-gray-900')}>
        {value}
      </p>
    </div>
  );
}
