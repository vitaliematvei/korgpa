export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-bold mb-6">KORG PA Set-uri PRO</h1>
      <div className="max-w-3xl space-y-6 text-gray-700">
        <p>
          Bun venit la <strong>KORG PA Set-uri PRO</strong>, magazinul tău
          online de încredere!
        </p>
        <p>
          Suntem dedicați să oferim produse de calitate cu preturi competitive
          și servicii de livrare rapide și sigure pe tot globul.
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-8">
          De ce să ne alegi?
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>✅ Produse create cu grijă</li>
          <li>✅ Prețuri competitive</li>
          <li>✅ Livrare rapidă (max. 3 zile)</li>
          <li>✅ Garanție de calitate</li>
          <li>✅ Suport client disponibil</li>
        </ul>
        <p className="text-gray-600 text-sm mt-8">
          Alte întrebări?{' '}
          <a href="/contact" className="text-blue-600 hover:underline">
            Contactează-ne
          </a>
        </p>
      </div>
    </div>
  );
}
