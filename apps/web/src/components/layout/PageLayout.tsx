interface PageLayoutProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ actions, children }: PageLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {actions && (
            <div className="mb-6 flex items-center justify-end">
              <div className="flex items-center gap-3">{actions}</div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
