export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // RAOS dark navy gradient — matches login/forgot-password hero & PWA splash
  return (
    <div className="min-h-screen bg-gradient-to-br from-raos-bg-deep via-raos-bg-main to-raos-bg-deep">
      {children}
    </div>
  );
}
