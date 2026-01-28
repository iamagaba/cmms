import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutProvider } from '@/components/LayoutProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { BadgeProvider } from '@/context/BadgeContext';

export const metadata: Metadata = {
  title: 'Fleet CMMS Mobile',
  description: 'Mobile-optimized CMMS for field technicians',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fleet CMMS Mobile',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/maskable-icon-192x192.png',
    apple: '/icons/maskable-icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen antialiased">
        <AuthProvider>
          <BadgeProvider>
            <ToastProvider>
              <LayoutProvider>{children}</LayoutProvider>
            </ToastProvider>
          </BadgeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}