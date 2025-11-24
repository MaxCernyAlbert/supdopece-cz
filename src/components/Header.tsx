'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { config } from '@/data/config';

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Kontrola, jestli je uživatel přihlášený
    const name = localStorage.getItem('userName');
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    setUserName(null);
  };

  return (
    <header className="bg-bread-dark text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🍞</span>
            <div>
              <h1 className="text-xl font-bold">{config.name}</h1>
              <p className="text-sm text-bread-light opacity-80">{config.tagline}</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="hover:text-primary-300 transition-colors hidden md:block">
              Objednat
            </Link>
            <Link href="#kontakt" className="hover:text-primary-300 transition-colors hidden md:block">
              Kontakt
            </Link>

            {userName ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden md:inline">👤 {userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm hover:text-primary-300 transition-colors"
                >
                  Odhlásit
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/prihlaseni"
                  className="text-sm hover:text-primary-300 transition-colors"
                >
                  📱 Přihlásit
                </Link>
                <Link
                  href="/admin"
                  className="text-sm hover:text-primary-300 transition-colors hidden md:inline"
                >
                  👨‍💼 Admin
                </Link>
              </div>
            )}

            {/* Mobilní indikátor košíku */}
            <div className="lg:hidden relative">
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
