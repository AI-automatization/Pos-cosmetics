export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-gray-900 to-gray-950">
      {children}
    </div>
  );
}
