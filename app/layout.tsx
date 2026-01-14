import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';

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
    <html lang="ro">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <CartProvider>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
