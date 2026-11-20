import type { Metadata } from 'next';
import './globals.css';
import { ProgressOSProvider } from '@/context/ProgressOSContext';
import { UIProvider } from '@/context/UIContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';

import { NavigationProgressProvider } from '@/context/NavigationProgressContext';

export const metadata: Metadata = {
  title: 'ProgressOS — Personal Learning Operating System',
  description: 'A polished, production-grade personal learning and progress-tracking operating system.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="h-full overflow-hidden bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <ProgressOSProvider>
            <UIProvider>
              <NavigationProgressProvider>
                <AppShell>{children}</AppShell>
              </NavigationProgressProvider>
            </UIProvider>
          </ProgressOSProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
