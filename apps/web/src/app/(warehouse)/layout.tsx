'use client';

import { useState, useCallback } from 'react';
import { WarehouseSidebar } from '@/components/layout/WarehouseSidebar';
import { WarehouseHeader } from '@/components/layout/WarehouseHeader';

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = useCallback(() => setMobileOpen((v) => !v), []);
  const close = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <WarehouseSidebar mobileOpen={mobileOpen} onMobileClose={close} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <WarehouseHeader onMenuToggle={toggle} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
