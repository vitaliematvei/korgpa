import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Hero from './components/Hero';

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

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Catalog Section */}
      <section className="container mx-auto p-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Catalog Produse</h1>
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
                  className="w-full h-48 object-cover mb-4 rounded"
                  priority
                />
              )}
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600 text-lg mt-1">
                € {product.price.toFixed(2)}
              </p>
              {/* Link catre pagina de detalii (pe care o vom crea in pasul urmator) */}
              <a
                href={`/product/${product.slug}`}
                className="mt-3 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Vezi Detalii
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
