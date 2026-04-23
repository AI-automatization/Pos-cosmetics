'use client';

import { CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface StepDef {
  id: number;
  label: string;
  icon: LucideIcon;
}

interface StepBarProps {
  steps: StepDef[];
  current: number;
}

// Violet-themed step indicator for the tenant creation wizard
export function StepBar({ steps, current }: StepBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-y-2">
      {steps.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition',
                done && 'border-violet-600 bg-violet-600 text-white',
                active && 'border-violet-600 bg-white text-violet-600',
                !done && !active && 'border-gray-300 bg-white text-gray-400',
              )}
            >
              {done ? <CheckCircle className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={cn(
                'ml-2 hidden text-sm font-medium sm:inline',
                active ? 'text-violet-700' : done ? 'text-violet-500' : 'text-gray-400',
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="mx-3 h-4 w-4 text-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}
