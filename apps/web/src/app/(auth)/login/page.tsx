'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  const { mutate: login, isPending } = useLogin();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = t('validation.emailRequired');
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = t('validation.emailInvalid');
    if (!password) errs.password = t('validation.passwordRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login({ email: email.trim(), password, slug: '' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 overflow-hidden rounded-2xl shadow-lg shadow-raos-cyan/30 ring-1 ring-white/10">
            <Image src="/icon.png" alt="RAOS" width={64} height={64} priority />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">RAOS</h1>
          <p className="mt-1 text-sm text-raos-cyan-light">Retail & Asset Operating System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 text-lg font-semibold text-white">{t('auth.signIn')}</h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="owner@example.com"
                autoComplete="email"
                className={cn(
                  'w-full rounded-xl border bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition',
                  'focus:ring-2 focus:ring-raos-cyan',
                  errors.email
                    ? 'border-red-400/60 focus:border-red-400'
                    : 'border-white/10 focus:border-raos-cyan',
                )}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'w-full rounded-xl border bg-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none transition',
                    'focus:ring-2 focus:ring-raos-cyan',
                    errors.password
                      ? 'border-red-400/60 focus:border-red-400'
                      : 'border-white/10 focus:border-raos-cyan',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition',
                'bg-raos-cyan text-raos-bg-deep shadow-lg shadow-raos-cyan/30',
                'hover:bg-raos-cyan-light active:scale-98',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('auth.verifying')}
                </>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm text-raos-cyan hover:text-raos-cyan-light transition-colors">
              {t('auth.forgotPassword')}
            </a>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} RAOS · Barcha huquqlar himoyalangan
        </p>
      </div>
    </div>
  );
}
