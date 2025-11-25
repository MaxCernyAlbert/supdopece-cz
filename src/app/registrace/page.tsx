'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegistrationPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'Registrace úspěšná!',
        });
        // Clear form
        setName('');
        setEmail('');
        setPhone('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Chyba při registraci',
        });
      }
    } catch {
      setResult({
        success: false,
        error: 'Chyba při komunikaci se serverem',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = name && (email || phone);

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="card p-8">
        <div className="text-center mb-6">
          <span className="text-6xl">📝</span>
          <h1 className="text-3xl font-bold text-bread-dark mt-4 mb-2">
            Registrace
          </h1>
          <p className="text-gray-600">
            Zaregistrujte se pro rychlejší objednávání
          </p>
        </div>

        {result?.success ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Registrace úspěšná!
            </h2>
            <p className="text-green-700 mb-4">
              {result.message}
            </p>
            <p className="text-sm text-green-600 mb-4">
              Zkontrolujte si {email && 'email'}{email && phone && ' a '}{phone && 'SMS'} pro přihlašovací odkaz.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-primary">
                Přejít na hlavní stránku
              </Link>
              <button
                onClick={() => setResult(null)}
                className="btn-secondary"
              >
                Zaregistrovat další účet
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Jan Novák"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="jan@email.cz"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pošleme vám přihlašovací odkaz
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="777 123 456"
              />
              <p className="text-xs text-gray-500 mt-1">
                Můžete se přihlásit přes SMS kód
              </p>
            </div>

            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              * Vyplňte alespoň jeden kontakt (email nebo telefon)
            </p>

            {result?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{result.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="btn-primary w-full"
            >
              {isLoading ? '⏳ Registruji...' : '📝 Zaregistrovat se'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600 mb-3">
            Už máte účet?
          </p>
          <Link href="/prihlaseni" className="btn-secondary w-full block text-center">
            Přihlásit se
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-600">
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}
