export default function FAQPage() {
  const faqs = [
    {
      id: 1,
      q: 'Cum plasez o comandă?',
      a: 'Selectează produsul, adaugă-l în coșul de cumpărături, și urmează pașii. Este foarte simplu!',
    },
    {
      id: 2,
      q: 'Care este costul livrării?',
      a: 'Livrarea se efectuează gratuit.',
    },
    {
      id: 3,
      q: 'Cât timp durează livrarea?',
      a: 'În mod normal livrarea se efectuează in scurt timp după finalizarea comenzii.',
    },
    {
      id: 4,
      q: 'Care este politica de retur?',
      a: 'Produsele digitale nu pot fi returnate după descărcare. Pentru probleme, contactează suportul nostru.',
    },
    {
      id: 5,
      q: 'Ce metode de plată acceptați?',
      a: 'Acceptăm cărți de credit (Visa, Mastercard). Platforma este securizată cu SSL.',
    },
    {
      id: 6,
      q: 'Unde sunt localizat?',
      a: 'Ialoveni, Republica Moldova. Livrăm oriunde pe glob.',
    },
    {
      id: 7,
      q: 'Oferți garanție?',
      a: 'Da, toate produsele au garanție de calitate.',
    },
  ];

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Întrebări Frecvente (FAQ)</h1>

      <div className="max-w-3xl space-y-6">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="bg-gray-50 p-6 rounded-lg cursor-pointer"
          >
            <summary className="text-lg font-semibold text-gray-900 flex justify-between items-center">
              {faq.q}
              <span className="text-blue-600 transition-transform duration-300 transform group-open:rotate-45 text-2xl">
                +
              </span>
            </summary>
            <p className="text-gray-700 mt-4 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
        <h2 className="text-xl font-bold mb-2">Nu ai găsit răspunsul?</h2>
        <p className="text-gray-700">
          Contactează echipa noastră de suport la
          <a
            href="mailto:muz4muz@gmail.com"
            className="text-blue-800 hover:underline"
          >
            <span className="mx-2 hover:scale-125">muz4muz@gmail.com</span>
          </a>
          sau apelează{' '}
          <span className="text-blue-800 hover:scale-125">+373 791 62 223</span>
          .
        </p>
      </div>
    </div>
  );
}
