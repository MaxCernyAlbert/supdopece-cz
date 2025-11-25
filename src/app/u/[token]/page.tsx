'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function UserLinkPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    // Verify token and login
    const verifyAndLogin = async () => {
      try {
        const res = await fetch(`/api/auth/magic-link?token=${token}`);
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
          localStorage.setItem('authToken', token);

          setUserName(data.name);
          setStatus('success');
        } else {
          setError(data.error || 'Neplatný odkaz');
          setStatus('error');
        }
      } catch {
        setError('Chyba při ověřování');
        setStatus('error');
      }
    };

    verifyAndLogin();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Ověřuji přístup...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Chyba</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/prihlaseni" className="btn-primary">
            Přihlásit se jinak
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="card p-8 max-w-md mx-auto">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-bread-dark mb-2">
          Vítej, {userName}!
        </h1>
        <p className="text-gray-600 mb-6">
          Jsi úspěšně přihlášen/a.
        </p>

        <div className="space-y-4">
          <Link href="/" className="btn-primary w-full block">
            🍞 Pokračovat na objednávku
          </Link>

          <div className="p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="font-bold text-blue-800 mb-2">📱 Ulož si tuto stránku</h3>
            <p className="text-sm text-blue-700 mb-3">
              Tento odkaz je tvůj trvalý přístup. Ulož si ho jako aplikaci:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>iPhone:</strong> Klikni na "Sdílet" → "Přidat na plochu"</li>
              <li><strong>Android:</strong> Menu (⋮) → "Přidat na plochu"</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500">
            Tvůj odkaz: <code className="bg-gray-100 px-1 rounded">/u/{token}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
