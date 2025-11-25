'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function UserLinkPage() {
  const params = useParams();
  const token = params.token as string;

  useEffect(() => {
    if (!token) return;

    // Verify token and login, then redirect
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

          // Redirect to home
          window.location.href = '/';
        } else {
          // Redirect to login on error
          window.location.href = '/prihlaseni';
        }
      } catch {
        window.location.href = '/prihlaseni';
      }
    };

    verifyAndLogin();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="card p-8 max-w-md mx-auto">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Přihlašuji...</p>
      </div>
    </div>
  );
}
