'use client';

import Link from 'next/link';
import { config } from '@/data/config';

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="card p-8">
        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-3xl font-bold text-bread-dark mb-4">
          Děkujeme za objednávku!
        </h1>

        <p className="text-gray-600 mb-6">
          Vaše objednávka byla úspěšně přijata. Na váš e-mail jsme zaslali potvrzení
          s detaily objednávky.
        </p>

        <div className="bg-primary-50 rounded-lg p-6 mb-8">
          <h2 className="font-bold text-primary-700 mb-2">Co bude následovat?</h2>
          <ul className="text-left text-primary-600 space-y-2">
            <li>📧 Obdržíte potvrzovací e-mail</li>
            <li>🍞 Připravíme vaše čerstvé pečivo</li>
            <li>📍 Vyzvednete si objednávku na adrese: {config.address}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link href="/" className="btn-primary inline-block">
            Pokračovat v nákupu
          </Link>

          <p className="text-sm text-gray-500">
            Máte otázky? Kontaktujte nás na {config.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
