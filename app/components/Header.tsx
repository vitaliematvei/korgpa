'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

import {
  HiOutlineShoppingCart,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
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

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Set-uri KORG PA', href: '/pa-series' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'About', href: '/about' },
];

interface NavLinkProps {
  item: NavItem;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavLink = ({ item, isMobile = false, onClick }: NavLinkProps) => {
  const baseClasses =
    ' px-3 py-2 rounded-md font-bold text-md text-white hover:bg-gray-700 transition duration-150 ease-in-out ';
  const mobileClasses =
    'block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700';
  const desktopClasses = 'block';

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

// Main Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    [isOpen]
  );

  const handleLinkClick = () => {
    // Only close if it's currently open (for mobile navigation)
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-gray-800 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="Go to KORG PA Sets Pro homepage"
          >
            <span className="text-3xl font-extrabold text-white tracking-widest">
              KORG
            </span>
            <span className="text-3xl font-extrabold text-blue-400 ml-1">
              PA
            </span>
            <span className="text-xl text-red-500 font-light ml-1 pt-2 hidden sm:inline">
              Set-uri PRO
            </span>
          </Link>

          {/* Desktop Navigation & Cart */}
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex space-x-8 mr-25">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.name} item={item} onClick={undefined} />
              ))}
            </div>

            {/* Cart Icon (Now a link for better UX) */}
            <Link
              href="/cart"
              aria-label={`View shopping cart with ${cartItemCount} items`}
              className="shrink-0"
            >
              <div className="relative p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-150 ease-in-out">
                <ShoppingCartIcon />

                {/* Cart Item Count Badge */}
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-gray-800 rounded-full animate-pulse">
                    {/* Added animation for visual cue */}
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Mobile Hamburger Button */}
            <div className="xl:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
          className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isMobile={true}
                onClick={handleLinkClick}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
