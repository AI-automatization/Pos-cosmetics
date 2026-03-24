import { ManagerSidebar } from '@/components/layout/ManagerSidebar';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ManagerSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
