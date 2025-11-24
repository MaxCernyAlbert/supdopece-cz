'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDemoCode('');

    try {
      const res = await fetch('/api/auth/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep('code');
        // Pro demo mód zobrazíme kód
        if (data.demoCode) {
          setDemoCode(data.demoCode);
        }
      } else {
        setError(data.error || 'Chyba při odesílání SMS');
      }
    } catch (err) {
      setError('Chyba při komunikaci se serverem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/auth/sms?phone=${encodeURIComponent(phone)}&code=${code}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        // Uložit přihlášení
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userPhone', data.phone);

        // Přesměrovat
        router.push('/');
      } else {
        setError(data.error || 'Neplatný kód');
      }
    } catch (err) {
      setError('Chyba při ověřování kódu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="card p-8">
        <div className="text-center mb-6">
          <span className="text-6xl">📱</span>
          <h1 className="text-2xl font-bold text-bread-dark mt-4 mb-2">
            Přihlášení
          </h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'Zadejte své telefonní číslo'
              : 'Zadejte kód z SMS'}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefonní číslo
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="777 123 456"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Můžete zadat i s předvolbou: +420 777 123 456
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Odesílám...' : 'Odeslat SMS s kódem'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                6místný kód
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            {demoCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  🔧 Demo mód - Váš kód:
                </p>
                <p className="text-3xl font-bold text-yellow-900 text-center tracking-wider">
                  {demoCode}
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  V produkci by kód přišel SMS zprávou
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="btn-primary w-full"
            >
              {isLoading ? 'Ověřuji...' : 'Přihlásit se'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
                setDemoCode('');
              }}
              className="btn-secondary w-full"
            >
              Změnit telefonní číslo
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Nemáte přístup?</strong><br/>
            Kontaktujte pekárnu pro registraci vašeho telefonního čísla.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-600">
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}
