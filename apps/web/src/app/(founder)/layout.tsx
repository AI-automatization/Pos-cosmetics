import { FounderSidebar } from '@/components/layout/FounderSidebar';

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <FounderSidebar />
      <main className="flex-1 overflow-hidden bg-gray-950">{children}</main>
    </div>
  );
}
