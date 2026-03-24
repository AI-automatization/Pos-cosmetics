import { BriefcaseBusiness } from 'lucide-react';

export default function ManagerDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <BriefcaseBusiness className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-500">Xush kelibsiz, Manager!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Bugungi savdo", value: "—", desc: "Hali ma'lumot yo'q" },
          { label: "Kam qolgan tovarlar", value: "—", desc: "Hali ma'lumot yo'q" },
          { label: "Ochiq nasiyalar", value: "—", desc: "Hali ma'lumot yo'q" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-gray-400">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
