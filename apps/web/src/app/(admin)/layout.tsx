'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MobileSidebarContext } from '@/components/layout/mobile-sidebar-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = useCallback(() => setMobileOpen((v) => !v), []);
  const close = useCallback(() => setMobileOpen(false), []);

  return (
    <MobileSidebarContext.Provider value={{ toggle }}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={close} />
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </MobileSidebarContext.Provider>
  );
}
