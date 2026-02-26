import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
