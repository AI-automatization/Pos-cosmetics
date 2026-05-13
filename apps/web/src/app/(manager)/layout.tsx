'use client';

import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { ManagerSidebar } from '@/components/layout/ManagerSidebar';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = useCallback(() => setMobileOpen((v) => !v), []);
  const close = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ManagerSidebar mobileOpen={mobileOpen} onMobileClose={close} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4">
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-gray-900">RAOS Manager</h1>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
