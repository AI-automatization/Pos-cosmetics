'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n-context';
import { apiClient } from '@/api/client';

type Step = 'email' | 'otp' | 'done';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsPending(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setStep('otp');
      toast.success(t('auth.otpSent'));
    } catch {
      toast.error(t('auth.otpError'));
    } finally {
      setIsPending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim() || newPassword.length < 8) return;
    setIsPending(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('done');
      toast.success(t('auth.passwordResetSuccess'));
    } catch {
      toast.error(t('auth.otpInvalid'));
    } finally {
      setIsPending(false);
    }
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
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8">
          {step === 'email' && (
            <>
              <h2 className="mb-2 text-lg font-semibold text-white">{t('auth.forgotPassword')}</h2>
              <p className="mb-6 text-sm text-white/60">{t('auth.forgotPasswordHint')}</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-raos-cyan focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending || !email}
                  className="w-full rounded-xl bg-raos-cyan py-3 text-sm font-semibold text-raos-bg-deep hover:bg-raos-cyan-light shadow-lg shadow-raos-cyan/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t('auth.sendCode')}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h2 className="mb-2 text-lg font-semibold text-white">{t('auth.enterCode')}</h2>
              <p className="mb-6 text-sm text-white/60">{t('auth.codeHint')}</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-white/40 focus:border-raos-cyan focus:outline-none"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('auth.newPassword')}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-raos-cyan focus:outline-none"
                />
                {newPassword && newPassword.length < 8 && (
                  <p className="text-xs text-red-400">{t('auth.passwordMin8')}</p>
                )}
                <button
                  type="submit"
                  disabled={isPending || otp.length !== 6 || newPassword.length < 8}
                  className="w-full rounded-xl bg-raos-cyan py-3 text-sm font-semibold text-raos-bg-deep hover:bg-raos-cyan-light shadow-lg shadow-raos-cyan/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t('auth.resetPassword')}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h2 className="mt-4 text-lg font-semibold text-white">{t('auth.passwordChanged')}</h2>
              <p className="mt-2 text-sm text-white/60">{t('auth.canLoginNow')}</p>
              <a
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-raos-cyan px-6 py-3 text-sm font-semibold text-raos-bg-deep hover:bg-raos-cyan-light shadow-lg shadow-raos-cyan/30"
              >
                {t('auth.login')}
              </a>
            </div>
          )}

          {step !== 'done' && (
            <div className="mt-4 text-center">
              <a href="/login" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white/70">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('auth.backToLogin')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
