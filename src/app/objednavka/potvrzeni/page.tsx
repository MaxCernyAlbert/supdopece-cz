'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { config } from '@/data/config';
import { formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const [pickupDate, setPickupDate] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPickupDate(params.get('date'));
    setPickupTime(params.get('time'));
    setOrderId(params.get('orderId'));
    setPaymentMethod(params.get('payment'));
    setAmount(params.get('amount'));
  }, []);

  const handleAddToCalendar = () => {
    if (!pickupDate || !pickupTime) {
      alert('Informace o vyzvednutí nejsou k dispozici');
      return;
    }

    // Parse date - handle both formats: yyyy-MM-dd and dd.MM.yyyy
    let year, month, day;
    if (pickupDate.includes('-')) {
      [year, month, day] = pickupDate.split('-');
    } else {
      [day, month, year] = pickupDate.split('.');
    }

    // Parse time - get start time from range (e.g., "10:00-12:00" -> "10:00")
    const timeRange = pickupTime.split('-')[0].trim();
    const [hours, minutes] = timeRange.split(':');

    // Create iCal event
    const eventDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${hours.padStart(2, '0')}${(minutes || '00').padStart(2, '0')}00`;
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    const eventEndDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${endHour}${(minutes || '00').padStart(2, '0')}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Šup do pece//Objednávka//CS',
      'BEGIN:VEVENT',
      `DTSTART:${eventDate}`,
      `DTEND:${eventEndDate}`,
      `SUMMARY:Vyzvednout pečivo - Šup do pece`,
      `LOCATION:${config.address}`,
      `DESCRIPTION:Vyzvednout objednávku ${orderId || ''} - čerstvé pečivo z pekárny Šup do pece`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    // Download .ics file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vyzvednuti-supdopece.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate QR code URL for bank payment (using QR payment standard)
  const generateQRCodeUrl = () => {
    if (!orderId || !amount) return null;

    // Czech QR payment format (Short Payment Descriptor - SPD)
    const accountNumber = config.qrPayment.accountNumber.replace('/', '');
    const bankCode = config.qrPayment.accountNumber.split('/')[1];
    const amountFormatted = amount;
    const variableSymbol = orderId.replace(/[^0-9]/g, '').substring(0, 10);
    const message = encodeURIComponent(config.qrPayment.message);

    // SPD format for Czech banks
    const spdString = `SPD*1.0*ACC:${accountNumber}+${bankCode}*AM:${amountFormatted}*CC:CZK*MSG:${message}*X-VS:${variableSymbol}`;

    // Use QR code generation API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(spdString)}`;
  };

  const qrCodeUrl = generateQRCodeUrl();

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

        {/* QR Payment section */}
        {paymentMethod === 'qrCode' && qrCodeUrl && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="font-bold text-blue-900 mb-3">📱 Platba QR kódem</h2>
            <p className="text-sm text-blue-800 mb-4">
              Naskenujte QR kód svou bankovní aplikací pro zaplacení objednávky
            </p>

            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img
                src={qrCodeUrl}
                alt="QR kód platby"
                className="w-64 h-64 mx-auto"
              />
            </div>

            <div className="text-left bg-white rounded-lg p-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Částka:</span>
                <span className="font-semibold">{amount && formatPrice(Number(amount))}&nbsp;Kč</span>

                <span className="text-gray-600">Číslo účtu:</span>
                <span className="font-semibold">{config.qrPayment.accountNumber}</span>

                <span className="text-gray-600">Variabilní symbol:</span>
                <span className="font-semibold">{orderId?.replace(/[^0-9]/g, '').substring(0, 10)}</span>

                <span className="text-gray-600">Zpráva:</span>
                <span className="font-semibold">{config.qrPayment.message}</span>
              </div>
            </div>

            <p className="text-xs text-blue-700 mt-3">
              💡 Platba musí být provedena před vyzvednutím objednávky
            </p>
          </div>
        )}

        <div className="bg-primary-50 rounded-lg p-6 mb-8">
          <h2 className="font-bold text-primary-700 mb-2">Co bude následovat?</h2>
          <ul className="text-left text-primary-600 space-y-2">
            <li>📧 Obdržíte potvrzovací e-mail</li>
            {paymentMethod === 'qrCode' && <li>💳 Zaplaťte pomocí QR kódu výše</li>}
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
