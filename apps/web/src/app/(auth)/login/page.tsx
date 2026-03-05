'use client';

import { useState } from 'react';
import { ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: login, isPending } = useLogin();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email kiritilmadi';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Email formati noto\'g\'ri';
    if (!password) errs.password = 'Parol kiritilmadi';
    if (!slug.trim()) errs.slug = 'Do\'kon slugi kiritilmadi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login({ email: email.trim(), password, slug: slug.trim() });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <ShoppingBag className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">RAOS</h1>
          <p className="mt-1 text-sm text-blue-300">Retail & Asset Operating System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 text-lg font-semibold text-white">Tizimga kirish</h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Do'kon slug */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-blue-200">
                Do&apos;kon slugi
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setErrors((p) => ({ ...p, slug: '' })); }}
                placeholder="my-store"
                autoComplete="organization"
                className={cn(
                  'w-full rounded-xl border bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition',
                  'focus:ring-2 focus:ring-blue-500',
                  errors.slug
                    ? 'border-red-400/60 focus:border-red-400'
                    : 'border-white/10 focus:border-blue-500',
                )}
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-red-400">{errors.slug}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-blue-200">
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
                  'focus:ring-2 focus:ring-blue-500',
                  errors.email
                    ? 'border-red-400/60 focus:border-red-400'
                    : 'border-white/10 focus:border-blue-500',
                )}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-blue-200">
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
                    'focus:ring-2 focus:ring-blue-500',
                    errors.password
                      ? 'border-red-400/60 focus:border-red-400'
                      : 'border-white/10 focus:border-blue-500',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
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
                'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
                'hover:bg-blue-500 active:scale-98',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tekshirilmoqda...
                </>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-white/30">
            Do&apos;kon slugingizni bilmasangiz, admin bilan bog&apos;laning
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} RAOS · Barcha huquqlar himoyalangan
        </p>
      </div>
    </div>
  );
}
