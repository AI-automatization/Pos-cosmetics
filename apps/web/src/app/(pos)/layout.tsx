// POS has its own full-screen layout — no sidebar
export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      {children}
    </div>
  );
}
