'use client';

import { LogOut } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/auth/useAuth';

export function WarehouseHeader() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : '?';
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';

  return (
    <header className="h-14 shrink-0 flex items-center justify-end gap-3 border-b border-gray-200 bg-white px-5">
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{fullName}</p>
            <p className="text-xs font-medium text-amber-600 leading-tight">{user.role}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 shrink-0">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            disabled={isPending}
            title="Chiqish"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
