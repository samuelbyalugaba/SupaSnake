
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { Providers } from '@/components/providers';
import { FirebaseClientProvider } from '@/firebase';
import { Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SettingsProvider } from '@/context/SettingsContext';
import AppWithSettings from '@/components/AppWithSettings';
import { AchievementProvider } from '@/context/AchievementContext';
import { CosmeticsProvider } from '@/context/CosmeticsContext';

export const metadata: Metadata = {
  title: 'Supa Snake',
  description: 'A modern, responsive Snake game with a retro neon theme.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  }
};

const Footer = () => {
  return (
    <footer className="w-full text-center text-muted-foreground text-sm p-4 shrink-0">
      <div className="flex items-center justify-center gap-1.5">
        <span>All Rights Reserved. Made With</span>
        <Heart className="w-4 h-4 text-primary fill-primary" /> 
        <span>@ TSJ Diversified Group</span>
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body>
        <FirebaseClientProvider>
          <Providers>
            <SettingsProvider>
                <AchievementProvider>
                  <CosmeticsProvider>
                    <AppWithSettings>
                      <Header />
                      <main className="flex-1 flex flex-col">
                        {children}
                      </main>
                      <Toaster />
                      <Footer />
                    </AppWithSettings>
                  </CosmeticsProvider>
                </AchievementProvider>
            </SettingsProvider>
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
