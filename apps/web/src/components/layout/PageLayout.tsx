import { Header } from './Header';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ title, subtitle, actions, children }: PageLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <Header title={title} subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {actions && (
            <div className="mb-6 flex items-center justify-between">
              <div />
              <div className="flex items-center gap-3">{actions}</div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
