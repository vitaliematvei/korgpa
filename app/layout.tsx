import type { Metadata } from 'next';
import Script from 'next/script';
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
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </CartProvider>
        <Script
          id="tawkto-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/696dfd9fc0ef74197c0bf870/1jfaqddq3';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
  // ...existing code...
}
