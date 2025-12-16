import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto p-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Plată Reușită!</h1>
        <p className="text-gray-600 mb-8">
          Mulțumim pentru cumpărătură! Comanda ta a fost procesată cu succes.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Vei primi un email de confirmare în curând cu detaliile comenzii.
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
