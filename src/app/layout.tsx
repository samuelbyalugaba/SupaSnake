import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { Providers } from '@/components/providers';
import { FirebaseClientProvider } from '@/firebase';
import { Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Supa Snake',
  description: 'A modern, responsive Snake game with a retro neon theme.',
};

const Footer = () => {
  return (
    <footer className="w-full text-center text-muted-foreground text-sm p-4">
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <FirebaseClientProvider>
          <Providers>
            <div className="flex-grow">
              {children}
            </div>
            <Toaster />
            <Footer />
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
