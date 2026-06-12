import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0E1530',
};

export const metadata: Metadata = {
  title: 'RAOS Admin',
  description: 'Retail & Asset Operating System — Admin Panel',
  other: { 'google': 'notranslate' },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" translate="no" suppressHydrationWarning>
      <body className="notranslate" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
