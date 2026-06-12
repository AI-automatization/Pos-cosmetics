'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Key,
  Package,
  Users,
  FolderTree,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { migrationApi } from '@/api/migration.api';
import type { MigrationSummary } from '@/api/migration.api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type InputType = 'password' | 'textarea' | 'multi';

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  type: InputType;
}

type Provider = {
  id: string;
  name: string;
  description: string;
  fields: CredentialField[];
  logo: string;
  category: 'api' | 'file' | 'universal';
};

const PROVIDERS: Provider[] = [
  // ── API-based (прямое подключение) ──
  {
    id: 'billz',
    name: 'Billz POS',
    description: 'Товары, категории, клиенты, филиалы',
    fields: [{ key: 'secretKey', label: 'Secret Key', placeholder: 'Настройки → Интеграции → Secret Key', type: 'password' }],
    logo: 'B',
    category: 'api',
  },
  {
    id: 'moysklad',
    name: 'МойСклад',
    description: 'Товары, категории, контрагенты',
    fields: [{ key: 'token', label: 'API Token', placeholder: 'Настройки → Доступ к API → Токен', type: 'password' }],
    logo: 'MC',
    category: 'api',
  },
  {
    id: 'poster',
    name: 'Poster POS',
    description: 'Меню, категории, клиенты',
    fields: [{ key: 'token', label: 'API Token', placeholder: 'Управление → API → Токен доступа', type: 'password' }],
    logo: 'P',
    category: 'api',
  },
  {
    id: 'iiko',
    name: 'iiko',
    description: 'Номенклатура, группы, цены',
    fields: [{ key: 'apiLogin', label: 'API Login', placeholder: 'iiko Cloud → API → Login key', type: 'password' }],
    logo: 'ii',
    category: 'api',
  },
  {
    id: 'rkeeper',
    name: 'R-Keeper',
    description: 'Меню, категории, цены',
    fields: [
      { key: 'serverUrl', label: 'URL сервера', placeholder: 'https://your-rkeeper-server.com', type: 'password' },
      { key: 'apiKey', label: 'API Key', placeholder: 'API ключ R-Keeper', type: 'password' },
    ],
    logo: 'RK',
    category: 'api',
  },
  {
    id: 'jowi',
    name: 'Jowi',
    description: 'Меню, категории, цены',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Jowi API Key', type: 'password' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Jowi API Secret', type: 'password' },
    ],
    logo: 'J',
    category: 'api',
  },
  {
    id: 'yespos',
    name: 'YesPOS',
    description: 'Товары, категории, клиенты',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'YesPOS API Key', type: 'password' }],
    logo: 'Y',
    category: 'api',
  },
  {
    id: 'optimo',
    name: 'Optimo',
    description: 'Товары, категории, клиенты',
    fields: [
      { key: 'apiUrl', label: 'API URL', placeholder: 'https://api.optimo.uz', type: 'password' },
      { key: 'token', label: 'Token', placeholder: 'Optimo API Token', type: 'password' },
    ],
    logo: 'O',
    category: 'api',
  },
  // ── File-based (экспорт → импорт) ──
  {
    id: '1c',
    name: '1C (CommerceML)',
    description: 'Экспорт каталога из 1C в XML формате',
    fields: [{ key: 'xmlData', label: 'XML данные', placeholder: '<?xml version="1.0"?>\n<КоммерческаяИнформация>...\n  <Каталог>\n    <Товар>...</Товар>\n  </Каталог>\n</КоммерческаяИнформация>', type: 'textarea' }],
    logo: '1C',
    category: 'file',
  },
  {
    id: 'smartdo',
    name: 'Smartdo',
    description: 'CSV экспорт из Smartdo (Nomi, Shtrixkod, Narxi)',
    fields: [{ key: 'csvData', label: 'CSV данные', placeholder: 'Nomi,Shtrixkod,Narxi,Tan narxi,Kategoriya\nNivea krem,4006040000,25000,15000,Kosmetika', type: 'textarea' }],
    logo: 'SD',
    category: 'file',
  },
  // ── Universal ──
  {
    id: 'csv',
    name: 'CSV / Excel (универсальный)',
    description: 'Любая система: SmartPOS, Regos, Alfapos, Arca, Excel',
    fields: [{ key: 'csvData', label: 'CSV данные', placeholder: 'name,sku,barcode,price,cost,category\nНивея крем,NIV-001,4006040000,25000,15000,Косметика', type: 'textarea' }],
    logo: 'CSV',
    category: 'universal',
  },
];

type PageState = 'select' | 'credentials' | 'validating' | 'migrating' | 'done' | 'error';

const CATEGORY_LABELS: Record<string, string> = {
  api: 'Через API (автоматически)',
  file: 'Через файл (экспорт → импорт)',
  universal: 'Универсальный',
};

export default function MigrationPage() {
  const [state, setState] = useState<PageState>('select');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setFieldValues({});
    setError(null);
    setState('credentials');
  };

  const updateField = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const allFieldsFilled = selectedProvider?.fields.every((f) => fieldValues[f.key]?.trim()) ?? false;

  const handleValidateAndMigrate = async () => {
    if (!selectedProvider || !allFieldsFilled) return;

    setState('validating');
    setError(null);

    try {
      const credentials = { ...fieldValues };
      const isFileProvider = selectedProvider.category === 'file' || selectedProvider.category === 'universal';

      if (!isFileProvider) {
        const valid = await migrationApi.validateCredentials(selectedProvider.id, credentials);
        if (!valid) {
          setError('Неверный ключ. Проверьте и попробуйте снова.');
          setState('credentials');
          return;
        }
        toast.success('Ключ проверен! Начинаем миграцию...');
      }

      setState('migrating');

      const result = await migrationApi.startMigrationSync(selectedProvider.id, credentials);
      setSummary(result);
      setState('done');
      toast.success('Миграция завершена!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка миграции';
      setError(message);
      setState('error');
      toast.error(message);
    }
  };

  const handleReset = () => {
    setState('select');
    setSelectedProvider(null);
    setFieldValues({});
    setSummary(null);
    setError(null);
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Step 1: Select Provider */}
        {state === 'select' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Откуда переносим данные?
            </h2>

            {(['api', 'file', 'universal'] as const).map((cat) => {
              const items = PROVIDERS.filter((p) => p.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className="grid gap-2">
                    {items.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleSelectProvider(provider)}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                          {provider.logo}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">{provider.name}</p>
                          <p className="truncate text-sm text-gray-500">{provider.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Enter Credentials */}
        {(state === 'credentials' || state === 'validating') && selectedProvider && (
          <div className="space-y-4">
            <button onClick={handleReset} className="text-sm text-blue-600 hover:underline">
              &larr; Назад к выбору
            </button>

            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-600">
                  {selectedProvider.logo}
                </div>
                <div>
                  <p className="font-semibold">{selectedProvider.name}</p>
                  <p className="text-sm text-gray-500">{selectedProvider.description}</p>
                </div>
              </div>

              {selectedProvider.fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Key className="h-4 w-4" />
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={fieldValues[field.key] ?? ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={8}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="password"
                      value={fieldValues[field.key] ?? ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleValidateAndMigrate}
                disabled={!allFieldsFilled || state === 'validating'}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
                  !allFieldsFilled || state === 'validating'
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-blue-600 hover:bg-blue-700',
                )}
              >
                {state === 'validating' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Проверяем ключ...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Начать миграцию
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Migrating */}
        {state === 'migrating' && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">Идёт миграция...</p>
              <p className="text-sm text-gray-500">
                Загружаем данные из {selectedProvider?.name} и импортируем в RAOS
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {state === 'done' && summary && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Миграция завершена!</p>
                <p className="text-sm text-green-600">
                  Из {summary.provider} за {(summary.durationMs / 1000).toFixed(1)} сек
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={Package}
                label="Товары"
                created={summary.products.created}
                updated={summary.products.updated}
                skipped={summary.products.skipped}
              />
              <StatCard
                icon={FolderTree}
                label="Категории"
                created={summary.categories.created}
                updated={0}
                skipped={summary.categories.skipped}
              />
              <StatCard
                icon={Users}
                label="Клиенты"
                created={summary.customers.created}
                updated={summary.customers.updated}
                skipped={summary.customers.skipped}
              />
            </div>

            {summary.errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-medium text-amber-800">
                  Ошибки ({summary.errors.length}):
                </p>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-amber-700">
                  {summary.errors.slice(0, 20).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {summary.errors.length > 20 && (
                    <li className="font-medium">...и ещё {summary.errors.length - 20}</li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Перенести из другой системы
            </button>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Ошибка миграции</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  created,
  updated,
  skipped,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  created: number;
  updated: number;
  skipped: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="space-y-1 text-sm">
        {created > 0 && (
          <p className="text-green-600">+{created} создано</p>
        )}
        {updated > 0 && (
          <p className="text-blue-600">{updated} обновлено</p>
        )}
        {skipped > 0 && (
          <p className="text-gray-400">{skipped} пропущено</p>
        )}
        {created === 0 && updated === 0 && skipped === 0 && (
          <p className="text-gray-400">0</p>
        )}
      </div>
    </div>
  );
}
