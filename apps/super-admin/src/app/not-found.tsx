import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300">404</h1>
        <p className="mt-4 text-lg text-slate-600">Страница не найдена</p>
        <Link
          href="/founder/overview"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
        >
          Вернуться в панель
        </Link>
      </div>
    </div>
  );
}
