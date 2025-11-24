import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StoreProvider } from '@/components/StoreProvider';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Sup do pece | Řemeslná pekárna',
  description: 'Pečeme z lásky, z kvásku a bez kompromisů. Objednejte si čerstvý chléb a pečivo online.',
  manifest: '/manifest.json',
  themeColor: '#8b5a2b',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sup do pece',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={`${inter.className} bg-bread-light min-h-screen flex flex-col`}>
        <StoreProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
