'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import assets from '@/asset/remoteAsset';

function getInitialAuthState() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src={assets.nav_logo}
                alt="FUNTECH Creative"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#how-it-works" className="text-gray-700 hover:text-indigo-600 transition-colors">
              How It Works
            </Link>
            <Link href="/#prizes" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Prizes
            </Link>
            <Link href="/#categories" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Categories
            </Link>
            <Link href="/contestants" className="text-violet-600 hover:text-violet-700 font-medium transition-colors">
              View Contestants
            </Link>
            {isAuthenticated ? (
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            ) : (
              <Link
                href="/register/payment-first"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Register Now
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/#how-it-works"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#prizes"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Prizes
            </Link>
            <Link
              href="/#categories"
              className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/contestants"
              className="block px-3 py-2 text-violet-600 hover:text-violet-700 font-medium hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              View Contestants
            </Link>
            <Link
              href={isAuthenticated ? '/login' : '/register/payment-first'}
              className="block px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {isAuthenticated ? 'Login' : 'Register Now'}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
