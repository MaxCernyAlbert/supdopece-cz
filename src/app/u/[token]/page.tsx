'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redirect stránka pro hezčí URL: /u/jan-novak
export default function UserLinkPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  useEffect(() => {
    // Přesměruj na verify s tokenem
    if (token) {
      router.push(`/auth/verify?token=${token}`);
    }
  }, [token, router]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-4xl mb-4">⏳</div>
      <p className="text-gray-600">Přesměrovávám...</p>
    </div>
  );
}
