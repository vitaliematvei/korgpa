'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [orderNumber] = useState(() => Math.floor(Math.random() * 100000000));
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: 'România',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Cărucior Gol</h1>
        <p className="text-gray-600 mb-8">
          Nu poți merge la checkout cu cărucior gol.
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

  if (orderPlaced) {
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 inline-block">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Comandă Plasată cu Succes!
          </h1>
          <p className="text-gray-600 mb-6">
            Comanda ta a fost primită. Vei primi un email de confirmare în
            curând.
          </p>
          <p className="text-gray-600 mb-6">
            <strong>Nr. Comandă:</strong> #{orderNumber}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
          >
            Înapoi acasă
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validare simplă
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.cardNumber
    ) {
      alert('Te rog completează toate câmpurile obligatorii!');
      return;
    }
    // Simulează plata
    alert('✓ Plata a fost procesată cu succes!');
    clearCart();
    setOrderPlaced(true);
  };

  const subtotal = total;
  const shipping = 10;
  const tax = subtotal * 0.19;
  const orderTotal = subtotal + shipping + tax;

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formular */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Shipping Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Informații de Livrare</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="Prenume *"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nume *"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefon"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <input
              type="text"
              name="address"
              placeholder="Adresă *"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded mt-4 focus:outline-none focus:border-blue-500"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <input
                type="text"
                name="city"
                placeholder="Oraș *"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                name="zip"
                placeholder="Cod Poștal"
                value={formData.zip}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option>România</option>
                <option>Europa</option>
                <option>Alte</option>
              </select>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Informații de Plată</h2>

            <input
              type="text"
              name="cardNumber"
              placeholder="Nr. Card (4111 1111 1111 1111) *"
              value={formData.cardNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="cardExpiry"
                placeholder="MM/YY"
                value={formData.cardExpiry}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                name="cardCVC"
                placeholder="CVC"
                value={formData.cardCVC}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              🔒 Plata ta este securizată și criptată.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-6 rounded text-lg font-bold hover:bg-blue-600 transition"
          >
            Finalizează Comanda
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-20">
          <h2 className="text-xl font-bold mb-4">Rezumat Comandă</h2>

          <div className="space-y-3 mb-6 pb-4 border-b">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6 pb-4 border-b text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livrare:</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxe (19%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
