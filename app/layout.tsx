import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import AppShell from './components/AppShell';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Korg PA Sets Pro',
  description:
    'Magazin online cu produse de calitate. Livrare rapidă și sigură.',
  keywords: ['Korg', 'PA', 'Set-uri', 'Keyboard', 'Sintetizator', 'Muzică'],
  openGraph: {
    title: 'Korg PA Sets Pro',
    description:
      'Magazin online cu produse de calitate. Livrare rapidă și sigură.',
    type: 'website',
    locale: 'ro_RO',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
