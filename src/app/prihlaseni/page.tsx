'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type LoginMethod = 'sms' | 'email';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('sms');
  const [step, setStep] = useState<'input' | 'code'>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
      let res;

      if (loginMethod === 'sms') {
        res = await fetch('/api/auth/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
      } else {
        res = await fetch('/api/auth/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setStep('code');
        // For demo mode display code
        if (data.demoCode) {
          setDemoCode(data.demoCode);
        }
      } else {
        setError(data.error || `Chyba při odesílání ${loginMethod === 'sms' ? 'SMS' : 'emailu'}`);
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
      let res;

      if (loginMethod === 'sms') {
        res = await fetch(`/api/auth/sms?phone=${encodeURIComponent(phone)}&code=${code}`);
      } else {
        res = await fetch(`/api/auth/email?email=${encodeURIComponent(email)}&code=${code}`);
      }

      const data = await res.json();

      if (res.ok && data.valid) {
        // Save login info
        localStorage.setItem('userName', data.name);
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        }
        if (data.phone) {
          localStorage.setItem('userPhone', data.phone);
        }

        // Hard redirect to refresh header
        window.location.href = '/';
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
          <span className="text-6xl">{loginMethod === 'sms' ? '📱' : '📧'}</span>
          <h1 className="text-2xl font-bold text-bread-dark mt-4 mb-2">
            Přihlášení
          </h1>
          <p className="text-gray-600">
            {step === 'input'
              ? `Zadejte sv${loginMethod === 'sms' ? 'é telefonní číslo' : 'ůj email'}`
              : `Zadejte kód z ${loginMethod === 'sms' ? 'SMS' : 'emailu'}`}
          </p>
        </div>

        {/* Login method toggle */}
        {step === 'input' && (
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod('sms')}
              className={`flex-1 py-2 rounded transition-colors ${
                loginMethod === 'sms'
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600'
              }`}
            >
              📱 SMS
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 rounded transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600'
              }`}
            >
              📧 Email
            </button>
          </div>
        )}

        {step === 'input' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            {loginMethod === 'sms' ? (
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="vas@email.cz"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Na tento email vám přijde přihlašovací kód
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
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading
                ? 'Odesílám...'
                : `Odeslat ${loginMethod === 'sms' ? 'SMS' : 'email'} s kódem`}
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
                  V produkci by kód přišel {loginMethod === 'sms' ? 'SMS zprávou' : 'emailem'}
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
                setStep('input');
                setCode('');
                setError('');
                setDemoCode('');
              }}
              className="btn-secondary w-full"
            >
              Změnit {loginMethod === 'sms' ? 'telefonní číslo' : 'email'}
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            💡 <strong>Nemáte účet?</strong>
          </p>
          <Link href="/registrace" className="btn-secondary w-full block text-center">
            📝 Zaregistrovat se
          </Link>
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
