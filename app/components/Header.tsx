'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  HiOutlineShoppingCart,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import { FaWhatsapp, FaViber } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';

// Shopping Cart Icon
const ShoppingCartIcon = () => (
  <HiOutlineShoppingCart
    className="w-6 h-6 text-white"
    aria-label="Shopping Cart"
  />
);

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <HiOutlineMenu {...props} aria-label="Open main menu" />
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <HiOutlineX {...props} aria-label="Close main menu" />
);

// Navigation Data Structure
interface NavItem {
  name: string;
  href: string;
}

interface NavDropdownItem {
  name: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavDropdownItem;

function isDropdown(item: NavEntry): item is NavDropdownItem {
  return 'children' in item;
}

const TUTORIALS_DROPDOWN: NavDropdownItem = {
  name: 'Tutoriale',
  children: [
    { name: 'Tutoriale PA4X', href: '/tutoriale-pa4x' },
    { name: 'Muzica pentru Naivi', href: '/muzica-pentru-naivi' },
    { name: 'Mixare Muzica', href: '/mixare-muzica' },
  ],
};

const NAV_ITEMS: NavEntry[] = [
  { name: 'Home', href: '/' },
  { name: 'Set-uri KORG PA', href: '/pa-series' },
  TUTORIALS_DROPDOWN,
  // { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'About', href: '/about' },
];

interface NavLinkProps {
  item: NavItem;
  isActive?: boolean;
  isMobile?: boolean;
  isReadingTutorial?: boolean;
  onClick?: () => void;
}

const NavLink = ({
  item,
  isActive = false,
  isMobile = false,
  isReadingTutorial = false,
  onClick,
}: NavLinkProps) => {
  const isFeaturedTutorial = false;
  const isTrafficSetItem = item.href === '/pa-series';
  const trafficEffectClass = isReadingTutorial
    ? 'traffic-light-item-quiet'
    : 'traffic-light-item';
  const baseClasses =
    'rounded-full transition-all duration-200 ease-in-out whitespace-nowrap';
  const mobileClasses = isTrafficSetItem
    ? isActive
      ? `${trafficEffectClass} traffic-light-item-mobile block w-full px-4 py-3 text-left text-base font-semibold text-white border border-white/30`
      : `${trafficEffectClass} traffic-light-item-mobile block w-full px-4 py-3 text-left text-base font-semibold text-white border border-white/20`
    : isFeaturedTutorial
      ? 'block w-full px-4 py-3 text-left text-base font-semibold text-amber-200 bg-amber-400/12 border border-amber-300/35 hover:bg-amber-300/18 hover:text-amber-100'
      : 'block w-full px-4 py-3 text-left text-base font-semibold text-slate-100 hover:bg-white/8 hover:text-white';
  const desktopClasses = isTrafficSetItem
    ? isActive
      ? `${trafficEffectClass} traffic-light-item-desktop block px-4 py-2 text-sm font-semibold text-white border border-white/30`
      : `${trafficEffectClass} traffic-light-item-desktop block px-4 py-2 text-sm font-semibold text-white border border-white/20`
    : isActive
      ? 'block px-4 py-2 text-sm font-semibold text-white bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
      : 'block px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/6 hover:text-white';

  return (
    <Link
      key={item.name}
      href={item.href}
      onClick={onClick}
      className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
    >
      {item.name}
    </Link>
  );
};

interface NavDropdownProps {
  item: NavDropdownItem;
  isMobile?: boolean;
  isReadingTutorial?: boolean;
  pathname: string;
  onClick?: () => void;
}

const NavDropdown = ({
  item,
  isMobile = false,
  isReadingTutorial = false,
  pathname,
  onClick,
}: NavDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAnyChildActive = item.children.some((child) =>
    pathname.startsWith(child.href),
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isMobile) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base font-semibold transition-all duration-200 ${
            isAnyChildActive
              ? 'text-amber-200 bg-amber-400/12 border border-amber-300/35'
              : 'text-amber-200 bg-amber-400/12 border border-amber-300/35 hover:bg-amber-300/18 hover:text-amber-100'
          }`}
          aria-expanded={open}
        >
          {item.name}
          <HiOutlineChevronDown
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="mt-1 ml-4 space-y-1 border-l border-amber-300/20 pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => {
                  setOpen(false);
                  onClick?.();
                }}
                className={`block rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith(child.href)
                    ? 'text-amber-100 bg-amber-400/20 border border-amber-300/45'
                    : 'text-slate-100 hover:bg-white/8 hover:text-white'
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
          isAnyChildActive
            ? 'text-amber-100 bg-amber-400/20 border border-amber-300/45 shadow-[0_0_0_1px_rgba(252,211,77,0.35),0_10px_20px_rgba(251,191,36,0.16)]'
            : 'text-amber-200 bg-amber-400/12 border border-amber-300/35 hover:bg-amber-300/18 hover:text-amber-100'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.name}
        <HiOutlineChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-50 rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-lg backdrop-blur">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith(child.href)
                  ? 'text-amber-100 bg-amber-400/20'
                  : 'text-slate-200 hover:bg-white/8 hover:text-white'
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isReadingTutorial =
    (pathname?.startsWith('/tutoriale-pa4x') ?? false) ||
    (pathname?.startsWith('/muzica-pentru-naivi') ?? false) ||
    (pathname?.startsWith('/mixare-muzica') ?? false);
  const { items } = useCart();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Memoize the icon element for performance
  const MobileMenuToggleIcon = useMemo(
    () =>
      isOpen ? (
        <CloseIcon className="h-6 w-6 text-white" />
      ) : (
        <MenuIcon className="h-6 w-6 text-white" />
      ),
    [isOpen],
  );

  const handleLinkClick = () => {
    // Only close if it's currently open (for mobile navigation)
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-slate-200/10 bg-slate-900/95 shadow-[0_10px_30px_rgba(15,23,42,0.22)] backdrop-blur"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:justify-normal">
            {/* Logo and Brand */}
            <Link
              href="/"
              className="flex shrink-0 items-end gap-1.5"
              aria-label="Go to KORG PA Sets Pro homepage"
            >
              <span className="text-3xl font-extrabold tracking-[0.18em] text-white">
                KORG
              </span>
              <span className="text-3xl font-extrabold text-sky-400">PA</span>
              <span className="mb-1 hidden text-sm font-semibold uppercase tracking-[0.2em] text-rose-400 sm:inline">
                Set-uri PRO
              </span>
            </Link>

            {/* Desktop Navigation (Centered) */}
            <div className="hidden justify-center lg:flex">
              <div className="flex items-center gap-2 xl:gap-3 rounded-full border border-white/8 bg-white/3 p-1.5">
                {NAV_ITEMS.map((item) =>
                  isDropdown(item) ? (
                    <NavDropdown
                      key={item.name}
                      item={item}
                      isReadingTutorial={isReadingTutorial}
                      pathname={pathname ?? ''}
                    />
                  ) : (
                    <NavLink
                      key={item.name}
                      item={item}
                      isActive={pathname === item.href}
                      isReadingTutorial={isReadingTutorial}
                      onClick={undefined}
                    />
                  ),
                )}
              </div>
            </div>

            {/* Desktop Actions & Cart */}
            <div className="flex items-center gap-3 lg:justify-self-end lg:gap-5">
              {/* Contact Info - WhatsApp & Viber */}
              <div className="hidden md:flex items-center gap-2 lg:gap-3">
                <a
                  href="https://wa.me/37379162223"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-emerald-300 transition duration-150 hover:border-emerald-300/40 hover:bg-emerald-400/15 hover:text-emerald-200"
                  aria-label="Contact via WhatsApp"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span className="hidden text-sm font-medium xl:inline">
                    WhatsApp
                  </span>
                </a>
                <a
                  href="viber://chat?number=%2B37379162223"
                  className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-2 text-violet-300 transition duration-150 hover:border-violet-300/40 hover:bg-violet-400/15 hover:text-violet-200"
                  aria-label="Contact via Viber"
                >
                  <FaViber className="h-4 w-4" />
                  <span className="hidden text-sm font-medium xl:inline">
                    Viber
                  </span>
                </a>
              </div>

              {/* Cart Icon (Now a link for better UX) */}
              <Link
                href="/cart"
                aria-label={`View shopping cart with ${cartItemCount} items`}
                className="shrink-0"
              >
                <div className="relative rounded-full border border-white/8 bg-white/6 p-2.5 transition duration-150 ease-in-out hover:bg-white/10">
                  <ShoppingCartIcon />

                  {/* Cart Item Count Badge */}
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-gray-800 rounded-full animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Mobile Hamburger Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  type="button"
                  className="rounded-full border border-white/10 p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded={isOpen}
                >
                  <span className="sr-only">
                    {isOpen ? 'Close main menu' : 'Open main menu'}
                  </span>
                  {MobileMenuToggleIcon}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu (Conditionally displayed) */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-128 opacity-100' : 'max-h-0 opacity-0'}`}
            id="mobile-menu"
          >
            <div className="mt-2 space-y-2 border-t border-white/10 px-2 pb-4 pt-3 sm:px-3">
              {NAV_ITEMS.map((item) =>
                isDropdown(item) ? (
                  <NavDropdown
                    key={item.name}
                    item={item}
                    isMobile={true}
                    isReadingTutorial={isReadingTutorial}
                    pathname={pathname ?? ''}
                    onClick={handleLinkClick}
                  />
                ) : (
                  <NavLink
                    key={item.name}
                    item={item}
                    isActive={pathname === item.href}
                    isMobile={true}
                    isReadingTutorial={isReadingTutorial}
                    onClick={handleLinkClick}
                  />
                ),
              )}

              {/* Mobile Contact Info */}
              <div className="mt-4 space-y-3 border-t border-white/10 pb-2 pt-4">
                <a
                  href="https://wa.me/37379162223"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-emerald-300 transition duration-150 hover:text-emerald-200"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="viber://chat?number=%2B37379162223"
                  className="flex items-center space-x-3 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-3 text-violet-300 transition duration-150 hover:text-violet-200"
                >
                  <FaViber className="w-5 h-5" />
                  <span>Viber</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        @keyframes trafficLightBlink {
          0%,
          100% {
            background: rgba(34, 197, 94, 0.16);
            box-shadow:
              inset 0 0 0 1px rgba(187, 247, 208, 0.28),
              0 0 0 1px rgba(74, 222, 128, 0.24),
              0 6px 14px rgba(34, 197, 94, 0.2),
              0 0 10px rgba(34, 197, 94, 0.22);
            transform: translateY(0);
          }
          50% {
            background: rgba(34, 197, 94, 0.56);
            box-shadow:
              inset 0 0 0 1px rgba(220, 252, 231, 0.82),
              0 0 0 1px rgba(74, 222, 128, 0.62),
              0 10px 20px rgba(34, 197, 94, 0.5),
              0 0 20px rgba(34, 197, 94, 0.54),
              0 0 34px rgba(74, 222, 128, 0.34);
            transform: translateY(0);
          }
        }

        .traffic-light-item {
          animation: trafficLightBlink 7s ease-in-out infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.22);
        }

        .traffic-light-item-quiet {
          animation: none;
          background: rgba(34, 197, 94, 0.18);
          box-shadow:
            inset 0 0 0 1px rgba(187, 247, 208, 0.26),
            0 0 0 1px rgba(74, 222, 128, 0.22),
            0 4px 10px rgba(34, 197, 94, 0.16);
          text-shadow: none;
        }

        .traffic-light-item-desktop:hover,
        .traffic-light-item-mobile:hover {
          animation-duration: 6.4s;
          filter: brightness(1.2) saturate(1.15);
        }
      `}</style>
    </>
  );
};

export default Navbar;
