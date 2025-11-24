'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [magicLink, setMagicLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMagicLink('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Magic link odeslán na váš email!');
        // Pro demo účely zobrazíme link
        if (data.magicLink) {
          setMagicLink(data.magicLink);
        }
      } else {
        setMessage('❌ Nepodařilo se odeslat magic link');
      }
    } catch (error) {
      setMessage('❌ Chyba při odesílání');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="card p-8">
        <div className="text-center mb-6">
          <span className="text-6xl">🔐</span>
          <h1 className="text-2xl font-bold text-bread-dark mt-4 mb-2">
            Přihlášení
          </h1>
          <p className="text-gray-600">
            Zadejte svůj email a dostanete odkaz pro přihlášení
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="vas@email.cz"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Odesílám...' : 'Odeslat přihlašovací odkaz'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg text-center">
            <p className="text-sm text-primary-700">{message}</p>
          </div>
        )}

        {magicLink && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              🔧 Demo mód - normálně by odkaz přišel emailem:
            </p>
            <a
              href={magicLink}
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {magicLink}
            </a>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-600">
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}
