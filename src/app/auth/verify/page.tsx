'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`/api/auth/magic-link?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setEmail(data.email);
          // Uložit do localStorage (včetně jména)
          localStorage.setItem('userName', data.name);
          localStorage.setItem('userEmail', data.email);
          localStorage.setItem('authToken', token);
          setStatus('success');

          // Přesměrovat po 2 sekundách
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token, router]);

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="card p-8">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-bread-dark mb-4">
              Ověřuji váš přístup...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-bread-dark mb-4">
              Přihlášení úspěšné!
            </h1>
            <p className="text-gray-600 mb-4">
              Vítejte zpět, {email}
            </p>
            <p className="text-sm text-gray-500">
              Za chvíli vás přesměrujeme...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-bread-dark mb-4">
              Neplatný nebo vypršelý odkaz
            </h1>
            <p className="text-gray-600 mb-6">
              Tento přístupový odkaz je neplatný nebo již vypršel.
            </p>
            <Link href="/auth/login" className="btn-primary inline-block">
              Požádat o nový odkaz
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
