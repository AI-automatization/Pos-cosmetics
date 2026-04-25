'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import {
  apiClient,
  SA_TOKEN_KEY,
  SA_ADMIN_ID_KEY,
  SA_ADMIN_ROLE_KEY,
  SA_SESSION_COOKIE,
  SA_ROLE_COOKIE,
  SA_COOKIE_MAX_AGE,
} from '@/api/client';

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

type LoginForm = z.infer<typeof schema>;

type AdminLoginResponse = {
  accessToken: string;
  admin: { id: string; name: string; email: string; role: string };
};

export default function FounderLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<AdminLoginResponse>('/admin/auth/login', data);
      const { accessToken, admin } = res.data;

      localStorage.setItem(SA_TOKEN_KEY, accessToken);
      localStorage.setItem(SA_ADMIN_ID_KEY, admin.id);
      localStorage.setItem(SA_ADMIN_ROLE_KEY, admin.role);

      document.cookie = `${SA_SESSION_COOKIE}=1; path=/; max-age=${SA_COOKIE_MAX_AGE}; SameSite=Lax`;
      document.cookie = `${SA_ROLE_COOKIE}=SUPER_ADMIN; path=/; max-age=${SA_COOKIE_MAX_AGE}; SameSite=Lax`;

      toast.success(`Добро пожаловать, ${admin.name}!`);
      router.push('/founder/overview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/30">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">RAOS</h1>
            <p className="text-sm text-violet-300">Super Admin Panel</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@raos.uz"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Пароль</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          RAOS Platform &copy; 2026
        </p>
      </div>
    </div>
  );
}
