'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE';

interface AuditLog {
  id: string;
  createdAt: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  detail: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}

const NOW = new Date().toISOString();
const HOUR_AGO = new Date(Date.now() - 3600000).toISOString();
const YESTERDAY = new Date(Date.now() - 86400000).toISOString();

const DEMO_LOGS: AuditLog[] = [
  { id: 'al-1', createdAt: NOW, userName: 'Malika Rahimova', userRole: 'ADMIN', action: 'UPDATE', entity: 'Product', entityId: 'p-3', detail: "Maybelline Pomada narxi o'zgartirildi", oldData: { sellPrice: 60000 }, newData: { sellPrice: 65000 } },
  { id: 'al-2', createdAt: NOW, userName: 'Jasur Karimov', userRole: 'CASHIER', action: 'CREATE', entity: 'Order', entityId: 'o-55', detail: 'ORD-0055 buyurtma yaratildi', newData: { total: 145000, items: 3 } },
  { id: 'al-3', createdAt: HOUR_AGO, userName: 'Malika Rahimova', userRole: 'ADMIN', action: 'APPROVE', entity: 'Return', entityId: 'r-1', detail: 'Qaytarish tasdiqlandi: ORD-0042', newData: { status: 'APPROVED' } },
  { id: 'al-4', createdAt: HOUR_AGO, userName: 'Jasur Karimov', userRole: 'CASHIER', action: 'LOGIN', entity: 'Session', entityId: 'sess-12', detail: 'Tizimga kirish', newData: { ip: '192.168.1.5' } },
  { id: 'al-5', createdAt: YESTERDAY, userName: 'Malika Rahimova', userRole: 'ADMIN', action: 'CREATE', entity: 'User', entityId: 'u-4', detail: "Yangi kassir qo'shildi: Nilufar Xasanova", newData: { role: 'CASHIER', phone: '+998904567890' } },
  { id: 'al-6', createdAt: YESTERDAY, userName: 'Abdulaziz Yusupov', userRole: 'OWNER', action: 'UPDATE', entity: 'Product', entityId: 'p-1', detail: 'Zaxira kirim qilindi', oldData: { currentStock: 30 }, newData: { currentStock: 45 } },
  { id: 'al-7', createdAt: YESTERDAY, userName: 'Nilufar Xasanova', userRole: 'CASHIER', action: 'LOGIN', entity: 'Session', entityId: 'sess-11', detail: 'Birinchi kirish', newData: { ip: '192.168.1.6' } },
];

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-gray-100 text-gray-600',
  LOGOUT: 'bg-gray-100 text-gray-600',
  APPROVE: 'bg-purple-100 text-purple-700',
};

function AuditRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = log.oldData || log.newData;

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => hasDiff && setExpanded((e) => !e)}>
        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
          {new Date(log.createdAt).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900">{log.userName}</p>
          <p className="text-xs text-gray-400">{log.userRole}</p>
        </td>
        <td className="px-4 py-3">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', ACTION_COLORS[log.action])}>
            {log.action}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{log.entity}</td>
        <td className="px-4 py-3 text-sm text-gray-700">{log.detail}</td>
        <td className="px-4 py-3">
          {hasDiff && (
            <button type="button" className="text-gray-400">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </td>
      </tr>
      {expanded && hasDiff && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-4 pt-1">
              {log.oldData && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-red-600">Oldingi</p>
                  <pre className="rounded-lg border border-red-100 bg-red-50 p-2 text-xs text-red-800">
                    {JSON.stringify(log.oldData, null, 2)}
                  </pre>
                </div>
              )}
              {log.newData && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-green-600">Yangi</p>
                  <pre className="rounded-lg border border-green-100 bg-green-50 p-2 text-xs text-green-800">
                    {JSON.stringify(log.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL');

  const filtered = DEMO_LOGS.filter((log) => {
    const matchSearch = !search || log.userName.toLowerCase().includes(search.toLowerCase()) || log.detail.toLowerCase().includes(search.toLowerCase()) || log.entity.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const ACTIONS: (AuditAction | 'ALL')[] = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE'];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Audit log</h1>
        <p className="mt-0.5 text-sm text-gray-500">Barcha muhim operatsiyalar tarixi</p>
      </div>

      {/* Demo notice */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Shield className="h-4 w-4 shrink-0" />
        Demo ma'lumotlar ko'rsatilmoqda — Backend (T-027) bajarilgach real loglar ko'rinadi
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Foydalanuvchi, harakat, entity..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as AuditAction | 'ALL')}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a === 'ALL' ? 'Barcha amallar' : a}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Vaqt', 'Foydalanuvchi', 'Amal', 'Entity', 'Tafsilot', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">Hech narsa topilmadi</td>
              </tr>
            ) : filtered.map((log) => (
              <AuditRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
