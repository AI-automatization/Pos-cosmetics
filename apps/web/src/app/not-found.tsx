import Link from 'next/link';
import { cookies, headers } from 'next/headers';

export default async function NotFound() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const role = cookieStore.get('user_role')?.value;
  const referer = headersList.get('referer') ?? '';
  const isFounderContext = role === 'SUPER_ADMIN' || referer.includes('/founder');
  const homeHref = isFounderContext ? '/founder/overview' : '/dashboard';
  const homeLabel = isFounderContext ? '← Вернуться в панель' : '← На главную';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <p className="text-7xl font-black text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Страница не найдена
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link
          href={homeHref}
          className="mt-6 inline-flex items-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
