import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <p className="text-7xl font-black text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Sahifa topilmadi</h1>
        <p className="mt-2 text-sm text-gray-500">
          Siz izlagan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
