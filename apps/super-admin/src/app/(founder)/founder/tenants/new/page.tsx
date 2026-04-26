'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, ChevronDown, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { StepBar } from './StepBar';
import { ResultScreen } from './ResultScreen';
import {
  STEPS, BUSINESS_TYPES, PLANS,
  companySchema, ownerSchema, planSchema, generatePassword,
  type CompanyForm, type OwnerForm, type PlanForm, type CreateResult,
} from './schemas';

// ─── Shared field helpers ────────────────────────────────────────────────────

const INPUT_CLS = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value ?? '-'}</span>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function NewTenantPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [legalOpen, setLegalOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [companyData, setCompanyData] = useState<CompanyForm | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerForm | null>(null);
  const [planData, setPlanData] = useState<PlanForm | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);

  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', slug: '', phone: '+998', city: '', businessType: 'COSMETICS' },
  });

  const ownerForm = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '+998', password: '', autoPassword: false },
  });

  const planForm = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: { planId: 'FREE', trialDays: 14, branchName: 'Основной филиал' },
  });

  const watchName = companyForm.watch('name');
  const autoSlug = watchName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30);

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<{ tenant: { slug: string }; owner: { email: string }; generatedPassword?: string }>('/admin/tenants/create', payload),
    onSuccess: (res) => {
      const d = res.data;
      const pwd = ownerData?.autoPassword ? (d.generatedPassword ?? null) : (ownerData?.password ?? null);
      setResult({
        tenantName: companyData?.name ?? '',
        slug: d.tenant?.slug ?? companyData?.slug ?? '',
        ownerEmail: d.owner?.email ?? ownerData?.email ?? '',
        ownerPhone: ownerData?.phone ?? '',
        password: pwd,
        planName: PLANS.find((p) => p.id === planData?.planId)?.name ?? '',
      });
      toast.success('Магазин создан!');
    },
    onError: () => {
      toast.error('Произошла ошибка. Попробуйте снова.');
    },
  });

  const onCompanySubmit = (data: CompanyForm) => { setCompanyData(data); setStep(2); };
  const onOwnerSubmit = (data: OwnerForm) => { setOwnerData(data); setStep(3); };
  const onPlanSubmit = (data: PlanForm) => { setPlanData(data); setStep(4); };

  const handleConfirm = () => {
    if (!companyData || !ownerData || !planData) return;
    const pwd = ownerData.autoPassword ? generatePassword() : ownerData.password;
    createMutation.mutate({
      name: companyData.name,
      slug: companyData.slug,
      phone: companyData.phone,
      city: companyData.city,
      businessType: companyData.businessType,
      customBusinessType: companyData.customBusinessType || undefined,
      legalName: companyData.legalName || undefined,
      inn: companyData.inn || undefined,
      stir: companyData.stir || undefined,
      oked: companyData.oked || undefined,
      legalAddress: companyData.legalAddress || undefined,
      owner: { firstName: ownerData.firstName, lastName: ownerData.lastName, email: ownerData.email, phone: ownerData.phone || undefined, password: pwd },
      planId: planData.planId,
      trialDays: planData.trialDays,
      branchName: planData.branchName,
    });
  };

  const backBtn = (onClick: () => void, label = 'Назад') => (
    <button type="button" onClick={onClick} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">{label}</button>
  );
  const nextBtn = (label: string, loading = false) => (
    <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
      {loading ? 'Создание...' : label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.push('/founder/tenants')} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Создание тенанта</h1>
          <p className="text-sm text-gray-500">Мастер из 4 шагов</p>
        </div>
      </div>

      {!result && <StepBar steps={STEPS} current={step} />}

      <div className="mx-auto w-full max-w-lg">
        {result ? (
          <ResultScreen result={result} />

        ) : step === 1 ? (
          <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Компания</h2>
            <Field label="Название" error={companyForm.formState.errors.name?.message}>
              <input {...companyForm.register('name')} placeholder="Например: Gulnora Kosmetika" className={INPUT_CLS} />
            </Field>
            <Field label="Slug (URL)" hint={`raos.uz/${autoSlug || 'your-slug'}`} error={companyForm.formState.errors.slug?.message}>
              <input {...companyForm.register('slug')} placeholder={autoSlug || 'gulnora-kosmetika'} className={INPUT_CLS}
                onFocus={(e) => { if (!e.target.value && autoSlug) companyForm.setValue('slug', autoSlug); }} />
            </Field>
            <Field label="Телефон" error={companyForm.formState.errors.phone?.message}>
              <input {...companyForm.register('phone')} placeholder="+998901234567" className={cn(INPUT_CLS, 'font-mono')} />
            </Field>
            <Field label="Город" error={companyForm.formState.errors.city?.message}>
              <input {...companyForm.register('city')} placeholder="Ташкент" className={INPUT_CLS} />
            </Field>
            <Field label="Тип бизнеса" error={companyForm.formState.errors.businessType?.message}>
              <SearchableDropdown
                options={Object.entries(BUSINESS_TYPES).map(([k, v]) => ({ value: k, label: v }))}
                value={companyForm.watch('businessType')}
                onChange={(val) => companyForm.setValue('businessType', val as CompanyForm['businessType'], { shouldValidate: true })}
                searchable={false} clearable={false} />
            </Field>
            {companyForm.watch('businessType') === 'OTHER' && (
              <Field label="Укажите тип бизнеса" hint="Например: Мебель, Стройматериалы, Автозапчасти">
                <input {...companyForm.register('customBusinessType')} placeholder="Введите свой тип бизнеса" className={INPUT_CLS} />
              </Field>
            )}

            <button type="button" onClick={() => setLegalOpen(!legalOpen)} className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700">
              <ChevronDown className={cn('h-4 w-4 transition-transform', legalOpen && 'rotate-180')} />
              Юридические данные
            </button>
            {legalOpen && (
              <div className="flex flex-col gap-3 rounded-lg border border-violet-100 bg-violet-50/30 p-4">
                <p className="text-xs text-violet-600">Данные для договоров и фискальных чеков. Необязательно — можно заполнить позже.</p>
                <Field label="Юр. название" hint="Полное юридическое наименование компании"><input {...companyForm.register('legalName')} placeholder='OOO "Gulnora"' className={INPUT_CLS} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="ИНН" hint="Идентификационный номер налогоплательщика (9 цифр)"><input {...companyForm.register('inn')} placeholder="123456789" className={INPUT_CLS} /></Field>
                  <Field label="СТИР" hint="Свидетельство о регистрации (9 цифр)"><input {...companyForm.register('stir')} placeholder="123456789" className={INPUT_CLS} /></Field>
                </div>
                <Field label="ОКЭД" hint="Код вида деятельности (напр. 47190 — розничная торговля)"><input {...companyForm.register('oked')} placeholder="47190" className={INPUT_CLS} /></Field>
                <Field label="Юр. адрес" hint="Адрес из свидетельства о регистрации"><input {...companyForm.register('legalAddress')} placeholder="г. Ташкент, Чиланзар р." className={INPUT_CLS} /></Field>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {backBtn(() => router.push('/founder/tenants'), 'Отмена')}
              {nextBtn('Далее')}
            </div>
          </form>

        ) : step === 2 ? (
          <form onSubmit={ownerForm.handleSubmit(onOwnerSubmit)} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Владелец (Owner)</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Имя" error={ownerForm.formState.errors.firstName?.message}>
                <input {...ownerForm.register('firstName')} placeholder="Gulnora" className={INPUT_CLS} />
              </Field>
              <Field label="Фамилия" error={ownerForm.formState.errors.lastName?.message}>
                <input {...ownerForm.register('lastName')} placeholder="Yusupova" className={INPUT_CLS} />
              </Field>
            </div>
            <Field label="Email" error={ownerForm.formState.errors.email?.message}>
              <input {...ownerForm.register('email')} type="email" placeholder="gulnora@example.com" className={INPUT_CLS} />
            </Field>
            <Field label="Телефон" error={ownerForm.formState.errors.phone?.message}>
              <input {...ownerForm.register('phone')} placeholder="+998901234567" className={cn(INPUT_CLS, 'font-mono')} />
            </Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoPassword" {...ownerForm.register('autoPassword')} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
              <label htmlFor="autoPassword" className="flex items-center gap-1.5 text-sm text-gray-700">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" /> Авто-пароль
              </label>
            </div>
            {!ownerForm.watch('autoPassword') && (
              <Field label="Пароль" error={ownerForm.formState.errors.password?.message} hint="Минимум 8 символов">
                <div className="relative">
                  <input {...ownerForm.register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className={INPUT_CLS} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            )}
            <div className="flex gap-2 pt-2">{backBtn(() => setStep(1))}{nextBtn('Далее')}</div>
          </form>

        ) : step === 3 ? (
          <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Выбор тарифа</h2>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const selected = planForm.watch('planId') === plan.id;
                return (
                  <button key={plan.id} type="button"
                    onClick={() => planForm.setValue('planId', plan.id, { shouldValidate: true })}
                    className={cn('flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition',
                      selected ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-200' : 'border-gray-200 bg-white hover:border-gray-300')}>
                    <span className={cn('text-sm font-semibold', selected ? 'text-violet-700' : 'text-gray-900')}>{plan.name}</span>
                    <span className="text-xs text-gray-500">
                      {plan.price > 0 ? `${(plan.price / 1000).toFixed(0)}k сум/мес` : plan.id === 'ENTERPRISE' ? 'Договор' : 'Бесплатно'}
                    </span>
                    <span className="mt-1 text-xs text-gray-400">{plan.desc}</span>
                  </button>
                );
              })}
            </div>
            {planForm.formState.errors.planId && <p className="text-xs text-red-500">{planForm.formState.errors.planId.message}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Пробный период (дней)" error={planForm.formState.errors.trialDays?.message}>
                <input type="number" {...planForm.register('trialDays', { valueAsNumber: true })} min={0} max={90} className={INPUT_CLS} />
              </Field>
              <Field label="Название первого филиала" error={planForm.formState.errors.branchName?.message}>
                <input {...planForm.register('branchName')} className={INPUT_CLS} />
              </Field>
            </div>
            <div className="flex gap-2 pt-2">{backBtn(() => setStep(2))}{nextBtn('Далее')}</div>
          </form>

        ) : (
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Подтверждение</h2>
            <div className="rounded-xl bg-violet-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">Компания</p>
              <SummaryRow label="Название" value={companyData?.name} />
              <SummaryRow label="Slug" value={companyData?.slug} />
              <SummaryRow label="Телефон" value={companyData?.phone} />
              <SummaryRow label="Город" value={companyData?.city} />
              <SummaryRow label="Тип" value={companyData?.businessType === 'OTHER' && companyData?.customBusinessType ? companyData.customBusinessType : BUSINESS_TYPES[companyData?.businessType ?? '']} />
              {companyData?.legalName && <SummaryRow label="Юр. название" value={companyData.legalName} />}
              {companyData?.inn && <SummaryRow label="ИНН" value={companyData.inn} />}
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Владелец</p>
              <SummaryRow label="Имя" value={`${ownerData?.firstName ?? ''} ${ownerData?.lastName ?? ''}`} />
              <SummaryRow label="Email" value={ownerData?.email} />
              <SummaryRow label="Телефон" value={ownerData?.phone || '-'} />
              <SummaryRow label="Пароль" value={ownerData?.autoPassword ? 'Автоматический' : '********'} />
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-500">Тариф</p>
              <SummaryRow label="Тариф" value={PLANS.find((p) => p.id === planData?.planId)?.name} />
              <SummaryRow label="Пробный период" value={`${planData?.trialDays ?? 14} дней`} />
              <SummaryRow label="Филиал" value={planData?.branchName} />
            </div>
            <div className="flex gap-2 pt-2">
              {backBtn(() => setStep(3))}
              <button type="button" onClick={handleConfirm} disabled={createMutation.isPending}
                className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                {createMutation.isPending ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
