'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadLinks, setDownloadLinks] = useState<
    { productName: string; url: string }[]
  >([]);

  useEffect(() => {
    const sendEmail = async () => {
      try {
        // Obține payment_intent din URL
        const paymentIntentId = searchParams.get('payment_intent');

        if (!paymentIntentId) {
          setEmailError('Payment intent ID missing');
          setIsLoading(false);
          return;
        }

        // Obține datele din localStorage (salvate la checkout)
        const cartData = localStorage.getItem('korgpa_cart');
        const checkoutEmail = localStorage.getItem('korgpa_checkout_email');

        if (!cartData || !checkoutEmail) {
          setEmailError('Cart or email data missing');
          setIsLoading(false);
          return;
        }

        const items = JSON.parse(cartData);

        // Trimite email prin API
        const response = await fetch('/api/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            email: checkoutEmail,
            items,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setEmailSent(true);
          setDownloadLinks(data.downloadLinks || []);
          // Curăță localStorage după succes
          localStorage.removeItem('korgpa_cart');
          localStorage.removeItem('korgpa_checkout_email');
        } else {
          setEmailError(data.error || 'Failed to send email');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        setEmailError('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    sendEmail();
  }, [searchParams]);

  return (
    <div className="container mx-auto p-4 py-12 text-center">
      <div className="max-w-lg mx-auto">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Plată Reușită!</h1>
        <p className="text-gray-600 mb-4">
          Mulțumim pentru cumpărătură! Comanda ta a fost procesată cu succes.
        </p>

        {/* Email Status */}
        {isLoading && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left">
            <p className="text-blue-800">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Se trimite emailul cu link-uri de download...
            </p>
          </div>
        )}

        {emailSent && (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 text-left">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Email trimis cu succes!
            </h3>
            <p className="text-green-800 text-sm mb-3">
              Am trimis un <strong>email</strong> cu link-urile de descărcare
              pentru produsele achiziționate.
            </p>
            <ul className="text-green-700 text-sm space-y-1">
              <li>✅ Verifică inbox-ul pentru link-uri download</li>
              <li>
                ✅ Link-urile sunt valide <strong>30 de zile</strong>
              </li>
              <li>
                ✅ Poți descărca fișierele de <strong>mai multe ori</strong>
              </li>
              <li>
                ✅ Verifică și folderul <strong>Spam/Junk</strong>
              </li>
            </ul>
            {downloadLinks.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold mb-2">Descarcă direct de aici:</h4>
                <ul className="space-y-2">
                  {downloadLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                      >
                        📥 {link.productName}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Link-urile rămân active 30 de zile.
                </p>
              </div>
            )}
          </div>
        )}

        {emailError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 text-left">
            <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Email temporar indisponibil
            </h3>
            <p className="text-yellow-800 text-sm mb-3">
              Nu am putut trimite emailul automat. Te rugăm să ne contactezi
              pentru a primi link-urile de download.
            </p>
            <p className="text-yellow-700 text-xs">Error: {emailError}</p>
          </div>
        )}

        {!isLoading && !emailSent && !emailError && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">📥</span>
              Link-uri de Download
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Vei primi un <strong>email</strong> în câteva secunde cu
              link-urile de descărcare.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Dacă nu primești emailul în 5 minute,{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            contactează-ne
          </Link>
          .
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 transition"
          >
            Continuă Cumpărăturile
          </Link>
          <br />
          <Link
            href="/contact"
            className="inline-block text-blue-500 hover:text-blue-600 transition"
          >
            Contactează-ne dacă ai întrebări
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
