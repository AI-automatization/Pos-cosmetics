import { FounderSidebar } from '@/components/layout/FounderSidebar';

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <FounderSidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
