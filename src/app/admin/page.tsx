'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveAdminSession, getAdminSession, clearAdminSession } from '@/lib/adminAuth';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [result, setResult] = useState<{
    success: boolean;
    magicLink?: string;
    emailSent?: boolean;
    smsSent?: boolean;
    error?: string;
  } | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedPassword = getAdminSession();
      if (savedPassword) {
        // Verify the saved password is still valid
        try {
          const res = await fetch(`/api/customers?password=${savedPassword}`);
          if (res.ok) {
            setAdminPassword(savedPassword);
            setIsAuthenticated(true);
          } else {
            clearAdminSession();
          }
        } catch {
          clearAdminSession();
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/customers?password=${adminPassword}`);
      if (res.ok) {
        saveAdminSession(adminPassword);
        setIsAuthenticated(true);
      } else {
        setLoginError('Nesprávné heslo');
      }
    } catch {
      setLoginError('Chyba při ověřování');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setAdminPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail || undefined,
          phone: customerPhone || undefined,
          adminPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          magicLink: data.magicLink,
          emailSent: data.emailSent,
          smsSent: data.smsSent,
        });
        // Vyčistit formulář
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Chyba při vytváření linku',
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Odkaz zkopírován!');
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="card p-8 text-center">
          <span className="text-4xl">⏳</span>
          <p className="mt-4 text-gray-600">Ověřuji přístup...</p>
        </div>
      </div>
    );
  }

  // Login form - show first before any admin content
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <span className="text-6xl">🔐</span>
            <h1 className="text-3xl font-bold text-bread-dark mt-4 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Pro přístup zadejte heslo
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heslo
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input-field"
                placeholder="Zadejte admin heslo"
                required
                autoFocus
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? '⏳ Ověřuji...' : '🔓 Přihlásit se'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary-600">
              ← Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show full admin panel
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="card p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-grow">
            <span className="text-6xl">👨‍💼</span>
            <h1 className="text-3xl font-bold text-bread-dark mt-4 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Vytvoř trvalý přístupový odkaz pro zákazníka
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            🚪 Odhlásit
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-3">Nový zákazník</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jméno zákazníka *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  placeholder="Jan Novák"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email zákazníka
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="input-field"
                  placeholder="jan@email.cz"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pokud vyplníte, pošle se magic link na email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon zákazníka
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field"
                  placeholder="777 123 456"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pokud vyplníte, pošle se magic link přes SMS
                </p>
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                * Vyplňte alespoň jeden kontakt (email nebo telefon). Magic link se pošle na všechny vyplněné kontakty.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!customerEmail && !customerPhone)}
            className="btn-primary w-full"
          >
            {isLoading ? '⏳ Vytvářím...' : '🔗 Vytvořit a odeslat odkaz'}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            {result.success && result.magicLink ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-bold text-green-800 mb-1">
                      Odkaz vytvořen!
                    </h3>
                    <p className="text-sm text-green-700">
                      Tento odkaz je <strong>trvalý</strong> a nikdy nevyprší.
                    </p>
                    {(result.emailSent || result.smsSent) && (
                      <p className="text-sm text-green-700 mt-1">
                        Odesláno: {result.emailSent && '📧 Email'} {result.emailSent && result.smsSent && '+'} {result.smsSent && '📱 SMS'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Odkaz pro zákazníka:</p>
                  <code className="text-xs text-gray-800 break-all block">
                    {result.magicLink}
                  </code>
                </div>

                <button
                  onClick={() => copyToClipboard(result.magicLink!)}
                  className="btn-secondary w-full text-sm"
                >
                  📋 Zkopírovat odkaz
                </button>

                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> Odkaz byl automaticky odeslán zákazníkovi.
                    Může si ho uložit na plochu telefonu jako aplikaci.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <p className="text-red-800">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-gray-700 mb-2">Jak to funguje?</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Vyplníš jméno a email/telefon zákazníka</li>
            <li>Systém vytvoří odkaz a pošle ho zákazníkovi</li>
            <li>Zákazník klikne → je automaticky přihlášený</li>
            <li>Může si uložit web jako aplikaci na telefon</li>
            <li>U každé objednávky uvidíš jeho jméno a kontakt</li>
          </ol>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/admin/zakaznici"
            className="btn-primary w-full block text-center"
          >
            👥 Seznam zákazníků
          </Link>
          <Link
            href="/admin/objednavky"
            className="btn-secondary w-full block text-center"
          >
            📊 Historie objednávek
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-600 block">
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}
