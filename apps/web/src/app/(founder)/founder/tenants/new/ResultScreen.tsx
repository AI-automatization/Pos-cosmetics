'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Copy, Store } from 'lucide-react';
import { toast } from 'sonner';

interface TenantResult {
  tenantName: string;
  slug: string;
  ownerEmail: string;
  ownerPhone: string;
  password: string | null;
  planName: string;
}

interface ResultScreenProps {
  result: TenantResult;
}

// Success screen after tenant creation — shows credentials with copy buttons
export function ResultScreen({ result }: ResultScreenProps) {
  const router = useRouter();
  const loginUrl = `https://raos.uz/${result.slug}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} скопировано`));
  };

  const credentials = [
    { label: 'URL входа', value: loginUrl },
    { label: 'Slug', value: result.slug },
    { label: 'Email', value: result.ownerEmail },
    { label: 'Телефон', value: result.ownerPhone },
    ...(result.password ? [{ label: 'Пароль', value: result.password }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Success banner */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-800">Тенант успешно создан!</h2>
        <p className="text-sm text-green-600">
          {result.tenantName} &mdash; тариф {result.planName}
        </p>
      </div>

      {/* Credentials card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Данные для входа</h3>
        </div>
        <div className="flex flex-col gap-3 p-5">
          {credentials.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-mono text-sm font-medium text-gray-900">{value}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(value, label)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* QR code placeholder */}
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8">
        <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gray-200">
          <Store className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-xs text-gray-400">QR код (в следующей версии)</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/founder/tenants')}
          className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          К списку тенантов
        </button>
        <button
          type="button"
          onClick={() => router.push('/founder/tenants/new')}
          className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Добавить ещё тенант
        </button>
      </div>
    </div>
  );
}
