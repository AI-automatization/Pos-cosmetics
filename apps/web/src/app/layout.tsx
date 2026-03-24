import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAOS Admin',
  description: 'Retail & Asset Operating System — Admin Panel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
