import { WarehouseSidebar } from '@/components/layout/WarehouseSidebar';
import { WarehouseHeader } from '@/components/layout/WarehouseHeader';

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <WarehouseSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <WarehouseHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
