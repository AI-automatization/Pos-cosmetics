'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { useCreateCampaign } from '@/hooks/sms/useCampaigns';
import { useTranslation } from '@/i18n/i18n-context';

export default function NewCampaignPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: create, isPending } = useCreateCampaign();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [phonesText, setPhonesText] = useState('');

  const phones = phonesText
    .split(/[\n,;]+/)
    .map((p) => p.replace(/\D/g, '').trim())
    .filter((p) => p.length >= 9);

  const isValid = name.trim().length > 0 && content.trim().length > 0 && content.length <= 160 && phones.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    create(
      { name: name.trim(), content: content.trim(), phones },
      { onSuccess: () => router.push('/campaigns') },
    );
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          {t('campaigns.back')}
        </Link>

        <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('campaigns.new')}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('campaigns.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('campaigns.namePlaceholder')}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">{t('campaigns.message')}</label>
              <span className={`text-xs ${content.length > 160 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {t('campaigns.charCount', { count: content.length })}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('campaigns.messagePlaceholder')}
              rows={3}
              maxLength={160}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">{t('campaigns.recipients')}</label>
              {phones.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">
                  {t('campaigns.recipientCount', { count: phones.length })}
                </span>
              )}
            </div>
            <textarea
              value={phonesText}
              onChange={(e) => setPhonesText(e.target.value)}
              placeholder={t('campaigns.recipientsPlaceholder')}
              rows={6}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-mono outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Preview */}
          {content && phones.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700 mb-2">Preview</p>
              <div className="rounded-lg bg-white p-3 text-sm text-gray-800 border border-blue-200">
                {content}
              </div>
              <p className="mt-2 text-xs text-blue-600">
                → {phones.length} {t('campaigns.recipients').toLowerCase()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/campaigns" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
              {t('campaigns.cancel')}
            </Link>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isPending ? t('common.saving') : t('campaigns.create')}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
