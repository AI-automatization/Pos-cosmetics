'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Building2, Users, Package, Rocket, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 1,
    icon: Building2,
    title: 'Filial yarating',
    description: 'Birinchi do\'kon filialingizni sozlang',
    action: '/branches',
    actionLabel: 'Filial qo\'shish',
  },
  {
    id: 2,
    icon: Users,
    title: 'Xodimlar qo\'shing',
    description: 'Kassir va menejerlarni tizimga qo\'shing',
    action: '/settings/users',
    actionLabel: 'Xodim qo\'shish',
  },
  {
    id: 3,
    icon: Package,
    title: 'Mahsulotlar kiriting',
    description: 'Katalog va tovarlarni sozlang',
    action: '/catalog/products',
    actionLabel: 'Mahsulot qo\'shish',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Tayyor!',
    description: 'POS va boshqaruv paneliga o\'ting',
    action: '/dashboard',
    actionLabel: 'Dashboard ga o\'tish',
  },
];

const LS_KEY = 'raos_onboarding_completed';

function loadCompleted(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(s: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]));
}

export default function OnboardingPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<number>>(loadCompleted);
  const [current, setCurrent] = useState<number>(() => {
    const done = loadCompleted();
    for (const step of STEPS) {
      if (!done.has(step.id)) return step.id;
    }
    return STEPS[STEPS.length - 1]!.id;
  });

  const totalSteps = STEPS.length;
  const doneCount = completed.size;
  const progress = Math.round((doneCount / totalSteps) * 100);

  const markDone = (stepId: number) => {
    const next = new Set(completed).add(stepId);
    setCompleted(next);
    saveCompleted(next);
    const nextStep = STEPS.find((s) => !next.has(s.id));
    if (nextStep) setCurrent(nextStep.id);
  };

  const handleAction = (step: typeof STEPS[0]) => {
    markDone(step.id);
    router.push(step.action);
  };

  const skip = () => router.push('/dashboard');

  if (doneCount === totalSteps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tabriklaymiz!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Barcha bosqichlar bajarildi. RAOS tizimidan foydalanishingiz mumkin.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Dashboard ga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RAOS ga xush kelibsiz!</h1>
            <p className="text-sm text-gray-500 mt-1">
              {doneCount}/{totalSteps} qadam bajarildi
            </p>
          </div>
          <button
            onClick={skip}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" /> O'tkazib yuborish
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-right text-gray-400">{progress}%</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const isDone = completed.has(step.id);
            const isActive = step.id === current && !isDone;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                onClick={() => !isDone && setCurrent(step.id)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                  isDone
                    ? 'bg-green-50 border-green-200 opacity-75'
                    : isActive
                    ? 'bg-white border-indigo-300 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300',
                )}
              >
                {/* Step icon */}
                <div className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                  isDone ? 'bg-green-500' : isActive ? 'bg-indigo-600' : 'bg-gray-100',
                )}>
                  {isDone
                    ? <Check className="h-5 w-5 text-white" />
                    : <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-400')} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', isDone ? 'text-green-700 line-through' : 'text-gray-900')}>
                    {step.id}. {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>

                {/* Action */}
                {isActive && !isDone && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAction(step); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                  >
                    {step.actionLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
                {isDone && (
                  <span className="text-xs font-medium text-green-600">Bajarildi</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Istalgan vaqtda o'tkazib yuborish mumkin. Sozlamalar &gt; Onboarding orqali qaytib kelishingiz mumkin.
        </p>

        {/* Demo warning */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">Demo rejim</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Bu hisob sinov uchun yaratilgan. Haqiqiy savdo va ma'lumotlarni ishlatishdan oldin
            administrator bilan bog'laning va to'liq versiyaga o'ting.
          </p>
        </div>
      </div>
    </div>
  );
}
