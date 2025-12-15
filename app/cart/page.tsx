'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { urlFor } from '@/sanity/lib/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Cărucior Gol</h1>
        <p className="text-gray-600 mb-8">
          Nu ai adăugat niciun produs în cărucior.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
        >
          Continuă Cumpărăturile
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Coș de Cumpărături</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 border border-gray-200 rounded-lg flex gap-4"
              >
                {/* Imagine */}
                {item.image && (
                  <div className="w-24 h-24 shrink-0">
                    <Image
                      src={urlFor(item.image).width(100).height(100).url()}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="grow">
                  <Link
                    href={`/product/${item.id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-gray-600">
                    Preț: €{item.price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-300 text-gray-800 py-1 px-2 rounded hover:bg-gray-400"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.id,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-12 text-center border border-gray-300 rounded py-1"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-300 text-gray-800 py-1 px-2 rounded hover:bg-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="text-right flex flex-col justify-between">
                  <p className="text-xl font-bold">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition text-sm"
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-20">
          <h2 className="text-2xl font-bold mb-4">Rezumat Comandă</h2>

          <div className="space-y-3 mb-6 border-b pb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livrare:</span>
              <span>0</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxe:</span>
              <span>0</span>
            </div>
          </div>

          <div className="flex justify-between text-2xl font-bold mb-6">
            <span>Total:</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full block bg-blue-500 text-white py-3 px-4 rounded text-center font-bold hover:bg-blue-600 transition mb-3"
          >
            Continuă Plata
          </Link>

          <button
            onClick={clearCart}
            className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition mb-3"
          >
            Golește Coșul
          </button>

          <Link
            href="/"
            className="w-full block text-center text-blue-600 hover:text-blue-700 transition py-2"
          >
            ← Continuă Cumpărăturile
          </Link>
        </div>
      </div>
    </div>
  );
}
