import Link from 'next/link';
import { FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4">
              KORG <span className="text-blue-400">PA </span>
              <span className="text-red-500">Set-uri PRO</span>
            </h3>
            <p className="text-sm">
              Magazin online de set-uri pentru clapele de model KORG seria PA.
              Calitate garantată.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Link-uri Rapide</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-white transition">
                  Set-uri KORG PA
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  Coș cumpărături
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Suport</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Întrebări Frecvente
                </Link>
              </li>
              <li></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <p className="text-sm mb-2">📧 muz4muz@gmail.com</p>
            <p className="text-sm mb-2">📱 +373 791 62 223</p>
            <p className="text-sm">📍 Ialoveni, Moldova</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>
            &copy; {currentYear} KORG PA Set-uri PRO. Toate drepturile
            rezervate.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="https://www.facebook.com/profile.php?id=61565751054955"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              <FaFacebookF className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.tiktok.com/@muz4muz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition"
            >
              <FaTiktok className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCbV4kXC9t_efczGchfi9dpg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition"
            >
              <FaYoutube className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
