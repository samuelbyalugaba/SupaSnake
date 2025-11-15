import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { Providers } from '@/components/providers';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Supa Snake',
  description: 'A modern, responsive Snake game with a retro neon theme.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
