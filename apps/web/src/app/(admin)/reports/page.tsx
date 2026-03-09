'use client';

import Link from 'next/link';
import { BarChart2, TrendingUp, Clock } from 'lucide-react';

const REPORT_LINKS = [
  {
    href: '/reports/daily-revenue',
    icon: BarChart2,
    title: 'Kunlik savdo',
    desc: 'Sana bo\'yicha savdo dinamikasi va grafik',
  },
  {
    href: '/reports/top-products',
    icon: TrendingUp,
    title: 'Top mahsulotlar',
    desc: 'Eng ko\'p sotilgan mahsulotlar ro\'yxati',
  },
  {
    href: '/reports/shifts',
    icon: Clock,
    title: 'Smena hisobotlari',
    desc: 'Smenalar bo\'yicha savdo va naqd hisobi',
  },
];

export default function ReportsIndexPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Hisobotlar</h1>
        <p className="mt-0.5 text-sm text-gray-500">Savdo va moliya tahlili</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {REPORT_LINKS.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
            </div>
            <span className="text-xs font-medium text-blue-600">Ko'rish →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
