'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

import Footer from './Footer';
import Header from './Header';
import { CartProvider } from '../context/CartContext';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith('/studio');

  if (isStudioRoute) {
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}
