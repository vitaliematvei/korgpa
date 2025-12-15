'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (
      formData.name &&
      formData.email &&
      formData.subject &&
      formData.message
    ) {
      try {
        // Folosește variabilele de mediu pentru EmailJS
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
          throw new Error(
            'EmailJS configuration is missing. Please check your environment variables.'
          );
        }

        const templateParams = {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'muz4muz@gmail.com', // Email-ul unde vrei să primești mesajele
        };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);

        alert('✓ Mesajul tău a fost trimis! Te vom contacta în curând.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } catch (err: any) {
        console.error('EmailJS error details:', err);
        setError(
          `Eroare la trimiterea mesajului: ${err?.text || 'Configurație EmailJS lipsă sau invalidă'}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Contact</h1>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Informații Contact</h3>
            <div className="space-y-4">
              <p>
                <strong>Email:</strong>
                <br />
                <a
                  href="muz4muz@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  muz4muz@gmail.com
                </a>
              </p>
              <p>
                <strong>Telefon:</strong>
                <br />
                <a
                  href="tel:+373 791 62 223"
                  className="text-blue-600 hover:underline"
                >
                  +373 791 62 223
                </a>
              </p>
              <p>
                <strong>Adresă:</strong>
                <br />
                Str. Alecsandru cel Bun
                <br />
                Ialoveni, 6801
                <br />
                Republica Moldova
              </p>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4">Program</h3>
            <div className="space-y-2">
              <p>
                <strong>Luni - Vineri:</strong> 9:00 - 18:00
              </p>
              <p>
                <strong>Sâmbătă:</strong> 9:00 - 13:00
              </p>
              <p>
                <strong>Duminică:</strong> Închis
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Trimite-ne un Mesaj</h2>

          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
              ✓ Mesajul tău a fost trimis cu succes!
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nume *"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
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
              type="text"
              name="subject"
              placeholder="Subiect *"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <textarea
              name="message"
              placeholder="Mesaj *"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            ></textarea>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se trimite...' : 'Trimite Mesaj'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
