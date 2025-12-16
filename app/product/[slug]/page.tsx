'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { PortableText } from '@portabletext/react';
import { FaYoutube, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  gallery: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  }[];
  image: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  details: {
    _type: string;
    _key: string;
    children: {
      _type: string;
      text: string;
    }[];
    markDefs: {
      _type: string;
      _key: string;
      href?: string;
    }[];
    style: string;
  }[];
  youtube?: string;
}

const PRODUCT_QUERY = `
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    'slug': slug.current,
    price,
    gallery,
    image,
    details,
    youtube
  }
`;

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      try {
        const data = await client.fetch(PRODUCT_QUERY, { slug });
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl">Se încarcă...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-red-500">Produsul nu a fost găsit.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image ? urlFor(product.image).url() : undefined,
    });

    alert(`✓ Adăugat ${quantity} x "${product.name}" în cărucior!`);
    setQuantity(1);
  };

  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="container mx-auto p-4 py-8">
      {/* Carousel si Detalii Produs in acelasi rind */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Imagine Carousel */}
        <div className="relative flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {currentImage && (
            <Image
              src={urlFor(currentImage).width(1200).height(600).url()}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-auto object-cover rounded-2xl"
              priority
            />
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
              >
                <FaChevronRight />
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detalii Produs */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-2xl font-bold text-blue-600 mb-6">
            €{product.price.toFixed(2)}
          </p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Cantitate:
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center border border-gray-300 rounded py-2"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded text-lg font-bold hover:bg-blue-600 transition mb-4"
          >
            🛒 Adaugă în Coș
          </button>

          {/* Additional Info */}
          <div className="bg-gray-50 py-4 rounded mt-6 text-sm">
            <strong>Garanție: </strong> de caliate<br></br>
            <strong>Livrare:</strong> max. 3 zile
            <p>
              <strong>Disponibilitate:</strong>{' '}
              <span className="text-green-600">În stoc</span>
            </p>
          </div>
          {product.youtube && (
            <div className="mb-6">
              <a
                href={product.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                <FaYoutube />
                <strong className="text-red-950">DEMO</strong> pe YouTube
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Descriere */}
      {product.details && product.details.length > 0 && (
        <div className="text-gray-700 leading-relaxed max-w-9xl mx-auto">
          <PortableText value={product.details} />
        </div>
      )}
    </div>
  );
}
