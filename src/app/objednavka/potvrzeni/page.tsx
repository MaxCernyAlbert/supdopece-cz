'use client';

import Link from 'next/link';
import { config } from '@/data/config';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const pickupDate = searchParams.get('date');
  const pickupTime = searchParams.get('time');

  const handleAddToCalendar = () => {
    if (!pickupDate || !pickupTime) {
      alert('Informace o vyzvednutí nejsou k dispozici');
      return;
    }

    // Parse date and time
    const [day, month, year] = pickupDate.split('.');
    const timeRange = pickupTime.split('-')[0]; // Get start time from range
    const [hours, minutes] = timeRange.split(':');

    // Create iCal event
    const eventDate = `${year}${month}${day}T${hours}${minutes}00`;
    const eventEndDate = `${year}${month}${day}T${parseInt(hours) + 1}${minutes}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${eventDate}`,
      `DTEND:${eventEndDate}`,
      'SUMMARY:Vyzvednutí objednávky - Šup do pece',
      `LOCATION:${config.address}`,
      'DESCRIPTION:Vyzvednout objednávku čerstvého pečiva',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    // Download .ics file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vyzvednuti-supdopece.ics';
    link.click();
    URL.revokeObjectURL(url);
  };
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
          <Link href="/" className="btn-primary inline-block w-full">
            Pokračovat v nákupu
          </Link>

          <button
            onClick={handleAddToCalendar}
            className="btn-secondary w-full"
          >
            📅 Přidat do kalendáře
          </button>

          <a
            href="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full inline-block bg-green-600 hover:bg-green-700 text-white"
          >
            ⭐ Ohodnoťte nás na Google
          </a>

          <p className="text-sm text-gray-500">
            Máte otázky? Kontaktujte nás na {config.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
          <div className="card p-8">
            <div className="text-4xl mb-4">⏳</div>
            <p>Načítám...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
