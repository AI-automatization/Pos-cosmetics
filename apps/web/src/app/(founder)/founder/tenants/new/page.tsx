'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, ChevronRight, Store, User, ClipboardCheck, Copy, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const shopSchema = z.object({
  name: z.string().min(2, "Do'kon nomi kamida 2 belgi"),
  slug: z.string()
    .min(3, 'Slug kamida 3 belgi')
    .max(30, 'Slug maksimal 30 belgi')
    .regex(/^[a-z0-9-]+$/, 'Faqat kichik harf, raqam va tire (-)'),
  phone: z.string().regex(/^\+998\d{9}$/, '+998 bilan boshlangan 12 raqam'),
  city: z.string().min(2, 'Shahar nomi kiriting'),
  businessType: z.enum(['COSMETICS', 'GROCERY', 'PHARMACY', 'FASHION', 'ELECTRONICS', 'OTHER']),
});

const ownerSchema = z.object({
  ownerName: z.string().min(2, 'Ism kamida 2 belgi'),
  ownerPhone: z.string().regex(/^\+998\d{9}$/, '+998 bilan boshlangan 12 raqam'),
  password: z.string().min(8, 'Parol kamida 8 belgi'),
});

type ShopForm = z.infer<typeof shopSchema>;
type OwnerForm = z.infer<typeof ownerSchema>;

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  COSMETICS: 'Kosmetika do\'koni',
  GROCERY: 'Oziq-ovqat do\'koni',
  PHARMACY: 'Dorixona',
  FASHION: 'Kiyim-kechak',
  ELECTRONICS: 'Elektronika',
  OTHER: 'Boshqa',
};

const STEPS = [
  { id: 1, label: "Do'kon ma'lumotlari", icon: Store },
  { id: 2, label: 'Egasi ma\'lumotlari', icon: User },
  { id: 3, label: 'Tasdiqlash', icon: ClipboardCheck },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition',
              done && 'border-violet-600 bg-violet-600 text-white',
              active && 'border-violet-600 bg-white text-violet-600',
              !done && !active && 'border-gray-300 bg-white text-gray-400',
            )}>
              {done ? <CheckCircle className="h-4 w-4" /> : step.id}
            </div>
            <span className={cn('ml-2 text-sm font-medium', active ? 'text-violet-700' : done ? 'text-violet-500' : 'text-gray-400')}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-3 h-4 w-4 text-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Result screen ────────────────────────────────────────────────────────────

function ResultScreen({ shopData, ownerData }: { shopData: ShopForm; ownerData: OwnerForm }) {
  const router = useRouter();
  const loginUrl = `https://raos.uz/${shopData.slug}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} nusxalandi`));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-800">Do'kon muvaffaqiyatli yaratildi!</h2>
        <p className="text-sm text-green-600">{shopData.name} tizimga qo'shildi</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Kirish ma'lumotlari</h3>
        </div>
        <div className="flex flex-col gap-3 p-5">
          {[
            { label: 'Kirish URL', value: loginUrl },
            { label: 'Slug', value: shopData.slug },
            { label: 'Egasi telefon', value: ownerData.ownerPhone },
            { label: 'Parol', value: ownerData.password },
          ].map(({ label, value }) => (
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
        <div className="h-28 w-28 rounded-lg bg-gray-200 flex items-center justify-center">
          <Store className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-xs text-gray-400">QR kod (T-059 backend tayyor bo'lgach)</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/founder/tenants')}
          className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Tenantlar ro'yxatiga
        </button>
        <button
          type="button"
          onClick={() => router.push(`/founder/tenants`)}
          className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Boshqa do'kon qo'shish
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewTenantPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shopData, setShopData] = useState<ShopForm | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerForm | null>(null);

  const shopForm = useForm<ShopForm>({
    resolver: zodResolver(shopSchema),
    defaultValues: { name: '', slug: '', phone: '+998', city: '', businessType: 'COSMETICS' },
  });

  const ownerForm = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { ownerName: '', ownerPhone: '+998', password: '' },
  });

  // Auto-generate slug from name
  const watchName = shopForm.watch('name');
  const autoSlug = watchName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30);

  const handleShopSubmit = (data: ShopForm) => {
    setShopData(data);
    setStep(2);
  };

  const handleOwnerSubmit = (data: OwnerForm) => {
    setOwnerData(data);
    setStep(3);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call — T-059 backend tayyor bo'lgach real call
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setDone(true);
    toast.success("Do'kon yaratildi!");
  };

  const InputField = ({
    label, error, hint, children,
  }: { label: string; error?: string; hint?: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/founder/tenants')}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Yangi do'kon qo'shish</h1>
          <p className="text-sm text-gray-500">SaaS tenant yaratish wizardi</p>
        </div>
      </div>

      {/* Step bar */}
      {!done && <StepBar current={step} />}

      {/* Content */}
      <div className="mx-auto w-full max-w-lg">
        {done && shopData && ownerData ? (
          <ResultScreen shopData={shopData} ownerData={ownerData} />
        ) : step === 1 ? (
          <form onSubmit={shopForm.handleSubmit(handleShopSubmit)} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Do'kon ma'lumotlari</h2>

            <InputField label="Do'kon nomi" error={shopForm.formState.errors.name?.message}>
              <input {...shopForm.register('name')} placeholder="Masalan: Gulnora Kosmetika" className={inputCls} />
            </InputField>

            <InputField
              label="Slug (URL uchun)"
              hint={`Misol: raos.uz/${autoSlug || 'sizning-dokoningiz'}`}
              error={shopForm.formState.errors.slug?.message}
            >
              <input
                {...shopForm.register('slug')}
                placeholder={autoSlug || 'gulnora-kosmetika'}
                className={inputCls}
                onFocus={(e) => { if (!e.target.value && autoSlug) shopForm.setValue('slug', autoSlug); }}
              />
            </InputField>

            <InputField label="Telefon raqam" error={shopForm.formState.errors.phone?.message}>
              <input {...shopForm.register('phone')} className={`${inputCls} font-mono`} placeholder="+998901234567" />
            </InputField>

            <InputField label="Shahar" error={shopForm.formState.errors.city?.message}>
              <input {...shopForm.register('city')} placeholder="Toshkent" className={inputCls} />
            </InputField>

            <InputField label="Biznes turi" error={shopForm.formState.errors.businessType?.message}>
              <select {...shopForm.register('businessType')} className={inputCls}>
                {Object.entries(BUSINESS_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </InputField>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => router.push('/founder/tenants')} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">Bekor</button>
              <button type="submit" className="flex-1 rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-700">Davom etish →</button>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={ownerForm.handleSubmit(handleOwnerSubmit)} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Egasi ma'lumotlari</h2>

            <InputField label="Ism va familiya" error={ownerForm.formState.errors.ownerName?.message}>
              <input {...ownerForm.register('ownerName')} placeholder="Gulnora Yusupova" className={inputCls} />
            </InputField>

            <InputField label="Telefon (login uchun)" error={ownerForm.formState.errors.ownerPhone?.message}>
              <input {...ownerForm.register('ownerPhone')} className={`${inputCls} font-mono`} placeholder="+998901234567" />
            </InputField>

            <InputField label="Boshlang'ich parol" error={ownerForm.formState.errors.password?.message} hint="Kamida 8 belgi — foydalanuvchi keyinchalik o'zgartira oladi">
              <input type="password" {...ownerForm.register('password')} placeholder="••••••••" className={inputCls} />
            </InputField>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">← Orqaga</button>
              <button type="submit" className="flex-1 rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-700">Davom etish →</button>
            </div>
          </form>
        ) : (
          // Step 3 — Confirm
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Tasdiqlash</h2>

            <div className="rounded-xl bg-violet-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">Do'kon</p>
              {[
                ['Nomi', shopData?.name],
                ['Slug', shopData?.slug],
                ['Telefon', shopData?.phone],
                ['Shahar', shopData?.city],
                ['Tur', BUSINESS_TYPE_LABELS[shopData?.businessType ?? '']],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Egasi</p>
              {[
                ['Ism', ownerData?.ownerName],
                ['Telefon', ownerData?.ownerPhone],
                ['Parol', '••••••••'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">← Orqaga</button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Yaratilmoqda...' : '✓ Yaratish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
