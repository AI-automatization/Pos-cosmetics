'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Building2, Users, Package, ShoppingCart, Rocket, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

// Static step metadata — labels resolved via t() inside the component
const STEP_META = [
  { id: 1, icon: Building2,    action: '/branches',       titleKey: 'step1Title', descKey: 'step1Desc', actionKey: 'step1Action' },
  { id: 2, icon: Users,        action: '/settings/users', titleKey: 'step2Title', descKey: 'step2Desc', actionKey: 'step2Action' },
  { id: 3, icon: Package,      action: '/catalog/import', titleKey: 'step3Title', descKey: 'step3Desc', actionKey: 'step3Action' },
  { id: 4, icon: ShoppingCart,  action: '/pos',            titleKey: 'step4Title', descKey: 'step4Desc', actionKey: 'step4Action' },
  { id: 5, icon: Rocket,       action: '/dashboard',      titleKey: 'step5Title', descKey: 'step5Desc', actionKey: 'step5Action' },
] as const;

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
  const { t } = useTranslation();
  const [completed, setCompleted] = useState<Set<number>>(loadCompleted);
  const [current, setCurrent] = useState<number>(() => {
    const done = loadCompleted();
    for (const step of STEP_META) {
      if (!done.has(step.id)) return step.id;
    }
    return STEP_META[STEP_META.length - 1]!.id;
  });

  const totalSteps = STEP_META.length;
  const doneCount = completed.size;
  const progress = Math.round((doneCount / totalSteps) * 100);

  const markDone = (stepId: number) => {
    const next = new Set(completed).add(stepId);
    setCompleted(next);
    saveCompleted(next);
    const nextStep = STEP_META.find((s) => !next.has(s.id));
    if (nextStep) setCurrent(nextStep.id);
  };

  const handleAction = (step: (typeof STEP_META)[number]) => {
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
          <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.congratulations')}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {t('onboarding.allDone')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full rounded-lg bg-raos-cyan px-4 py-2.5 text-sm font-semibold text-raos-bg-deep shadow-md shadow-raos-cyan/30 hover:bg-raos-cyan-light transition"
          >
            {t('onboarding.step4Action')}
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
          <div className="flex items-start gap-4">
            {/* Brand mark — RAOS welcome hero */}
            <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-2xl shadow-md shadow-raos-cyan/30 ring-1 ring-raos-cyan/20 sm:inline-flex">
              <Image src="/icon.png" alt="RAOS" width={48} height={48} priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.welcome')}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('onboarding.stepsProgress', { done: doneCount, total: totalSteps })}
              </p>
            </div>
          </div>
          <button
            onClick={skip}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" /> {t('onboarding.skip')}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-raos-cyan rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-right text-gray-400">{progress}%</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEP_META.map((step) => {
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
                    ? 'bg-white border-raos-cyan/40 shadow-sm shadow-raos-cyan/10'
                    : 'bg-white border-gray-200 hover:border-gray-300',
                )}
              >
                {/* Step icon */}
                <div className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                  isDone ? 'bg-green-500' : isActive ? 'bg-raos-cyan shadow-md shadow-raos-cyan/30' : 'bg-gray-100',
                )}>
                  {isDone
                    ? <Check className="h-5 w-5 text-white" />
                    : <Icon className={cn('h-5 w-5', isActive ? 'text-raos-bg-deep' : 'text-gray-400')} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', isDone ? 'text-green-700 line-through' : 'text-gray-900')}>
                    {step.id}. {t(`onboarding.${step.titleKey}`)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`onboarding.${step.descKey}`)}</p>
                </div>

                {/* Action */}
                {isActive && !isDone && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAction(step); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-raos-cyan text-raos-bg-deep rounded-lg shadow-sm shadow-raos-cyan/30 hover:bg-raos-cyan-light transition whitespace-nowrap"
                  >
                    {t(`onboarding.${step.actionKey}`)}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
                {isDone && (
                  <span className="text-xs font-medium text-green-600">{t('onboarding.stepDone')}</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          {t('onboarding.footerHint')}
        </p>

        {/* Demo warning */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">{t('onboarding.demoMode')}</p>
          <p className="mt-0.5 text-xs text-amber-700">
            {t('onboarding.demoDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
