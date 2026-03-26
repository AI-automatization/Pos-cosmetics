import { WarehouseSidebar } from '@/components/layout/WarehouseSidebar';

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <WarehouseSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
