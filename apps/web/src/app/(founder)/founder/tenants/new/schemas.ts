import { z } from 'zod';
import { Store, User, CreditCard, ClipboardCheck } from 'lucide-react';
import type { StepDef } from './StepBar';

// ─── Steps ───────────────────────────────────────────────────────────────────

export const STEPS: StepDef[] = [
  { id: 1, label: 'Компания', icon: Store },
  { id: 2, label: 'Владелец', icon: User },
  { id: 3, label: 'Тариф', icon: CreditCard },
  { id: 4, label: 'Подтверждение', icon: ClipboardCheck },
];

// ─── Business types ──────────────────────────────────────────────────────────

export const BUSINESS_TYPES: Record<string, string> = {
  COSMETICS: 'Косметика',
  GROCERY: 'Продукты',
  PHARMACY: 'Аптека',
  FASHION: 'Одежда',
  ELECTRONICS: 'Электроника',
  OTHER: 'Другое',
};

// ─── Plan cards ──────────────────────────────────────────────────────────────

export const PLANS = [
  { id: 'FREE', name: 'Free', price: 0, desc: '1 филиал, 1 касса, 100 товаров' },
  { id: 'BASIC', name: 'Basic', price: 99_000, desc: '3 филиала, 5 касс, безлимит товаров' },
  { id: 'PRO', name: 'Pro', price: 299_000, desc: '10 филиалов, безлимит касс, AI аналитика' },
  { id: 'ENTERPRISE', name: 'Enterprise', price: 0, desc: 'Индивидуальный договор, все возможности' },
] as const;

// ─── Zod schemas ─────────────────────────────────────────────────────────────

export const companySchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string().min(3, 'Минимум 3 символа').max(30).regex(/^[a-z0-9-]+$/, 'Только строчные буквы, цифры, дефис'),
  phone: z.string().regex(/^\+998\d{9}$/, 'Формат: +998XXXXXXXXX'),
  city: z.string().min(2, 'Укажите город'),
  businessType: z.enum(['COSMETICS', 'GROCERY', 'PHARMACY', 'FASHION', 'ELECTRONICS', 'OTHER']),
  customBusinessType: z.string().optional(),
  legalName: z.string().optional(),
  inn: z.string().optional(),
  stir: z.string().optional(),
  oked: z.string().optional(),
  legalAddress: z.string().optional(),
});

export const ownerSchema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  phone: z.string().regex(/^\+998\d{9}$/, 'Формат: +998XXXXXXXXX').or(z.literal('')).optional(),
  password: z.string().min(8, 'Минимум 8 символов').optional(),
  autoPassword: z.boolean(),
}).refine((d) => d.autoPassword || (d.password && d.password.length >= 8), {
  message: 'Пароль минимум 8 символов или выберите автоматический',
  path: ['password'],
});

export const planSchema = z.object({
  planId: z.string().min(1, 'Выберите тариф'),
  trialDays: z.number().min(0).max(90),
  branchName: z.string().min(2, 'Минимум 2 символа'),
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type CompanyForm = z.infer<typeof companySchema>;
export type OwnerForm = z.infer<typeof ownerSchema>;
export type PlanForm = z.infer<typeof planSchema>;

export interface CreateResult {
  tenantName: string;
  slug: string;
  ownerEmail: string;
  ownerPhone: string;
  password: string | null;
  planName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
