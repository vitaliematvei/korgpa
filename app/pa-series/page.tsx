import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

const PRODUCTS_QUERY = `
  *[_type == "product"] {
    _id,
    name,
    'slug': slug.current,
    price,
    image,
  }
`;

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
}

async function getProducts(): Promise<Product[]> {
  return client.fetch(PRODUCTS_QUERY);
}

export default async function PaSeriesPage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto p-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Set-uri KORG PA</h1>
      <p className="text-center mb-8 text-gray-600">
        Descoperă colecția noastră completă de set-uri KORG PA pentru muzicieni
        profesioniști și amatori.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white p-4 shadow-lg rounded-lg transform transition duration-300 hover:shadow-xl"
          >
            {/* Afisarea imaginii Sanity */}
            {product.image && (
              <Image
                src={urlFor(product.image).width(400).height(400).url()}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-lg font-bold text-blue-600 mb-4">
              {product.price} EUR
            </p>
            <Link
              href={product.slug ? `/product/${product.slug}` : '#'}
              className={`block w-full text-center py-2 rounded-md transition duration-300 ${
                product.slug 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              onClick={(e) => !product.slug && e.preventDefault()}
            >
              {product.slug ? 'Vezi Detalii' : 'Slug lipsă'}
            </Link>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center text-gray-500">
          Nu există produse disponibile în această categorie.
        </p>
      )}
    </main>
  );
}
