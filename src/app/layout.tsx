import type { Metadata } from 'next';
import './globals.css';
import { ProgressOSProvider } from '@/context/ProgressOSContext';
import { UIProvider } from '@/context/UIContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'ProgressOS — Personal Learning Operating System',
  description: 'A polished, production-grade personal learning and progress-tracking operating system.',
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
              <AppShell>{children}</AppShell>
            </UIProvider>
          </ProgressOSProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
