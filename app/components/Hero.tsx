import Image from 'next/image';

import Link from 'next/link';
import { HiArrowRight, HiOutlineSparkles } from 'react-icons/hi';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/Hero-BG2.png"
        alt="Background Hero"
        fill
        className="object-cover object-center mx-auto absolute inset-0 -z-10 "
      />
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content Container  */}
      <div className="relative h-full max-w-8xl mx-auto flex items-center min-h-[450px] py-20 ">
        {/* Wrapper pentru continutul din stanga (50% din latime) */}
        <div className="w-full xl:w-1/2 flex flex-col items-center px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full hover:border-blue-500/60 transition duration-300">
            <HiOutlineSparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Noile Set-uri KORG PA
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-black text-white text-center  leading-tight tracking-tight mb-8">
            <span className="inline-block mb-2">Muzică</span>
            <span className="block bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fără Limite
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl leading-relaxed mb-10">
            Descoperă puterea seturilor KORG PA profesionale. Sunet de studio,
            performanță live și creativitate infinită în fiecare notă.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-15 justify-center items-center">
            <Link
              href="/pa-series"
              className="group relative px-7 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Explorează Colecția
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/blog"
              className="px-7 py-3 border-2 border-blue-400/50 text-blue-300 font-bold rounded-lg hover:bg-blue-400/10 hover:border-blue-400 transition-all duration-300 backdrop-blur-sm"
            >
              Citește Blog-ul
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
