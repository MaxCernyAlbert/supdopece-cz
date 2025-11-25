'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { DateTimePicker } from '@/components/DateTimePicker';
import { config } from '@/data/config';
import { formatDate } from '@/lib/utils';

type PaymentMethod = 'card' | 'onPickup';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  note: string;
}

export default function OrderPage() {
  const router = useRouter();
  const { items, getTotalPrice, pickupDate, pickupTime, setPickupDateTime, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('onPickup');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load logged-in customer
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    if (userName && userEmail) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: userName,
        email: userEmail,
      }));
    }
  }, []);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-bread-dark mb-4">Váš košík je prázdný</h1>
        <Link href="/" className="btn-primary inline-block">
          Zpět na nákup
        </Link>
      </div>
    );
  }

  const handleDateTimeSelect = (date: string, time: string) => {
    setPickupDateTime(date, time);
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = pickupDate && pickupTime;
  const isStep2Valid = customerInfo.name && customerInfo.email && customerInfo.phone;

  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) return;

    setIsSubmitting(true);

    try {
      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          items,
          totalPrice,
          pickupDate,
          pickupTime,
          note: customerInfo.note,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error('Chyba při vytváření objednávky');
      }

      if (paymentMethod === 'card') {
        // Redirect to payment gateway
        // In production this would redirect to Stripe/GoPay
        alert('Zde by následoval přesměrování na platební bránu');
      }

      // Success - clear cart and redirect
      clearCart();
      router.push(`/objednavka/potvrzeni?date=${pickupDate}&time=${pickupTime}&orderId=${data.order.id}`);
    } catch (error) {
      console.error('Chyba při odesílání objednávky:', error);
      alert('Nastala chyba při odesílání objednávky. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-bread-dark mb-8">Dokončení objednávky</h1>

      {/* Progress bar */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > s ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Hlavní obsah */}
        <div className="md:col-span-2">
          {/* Krok 1: Výběr času */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-bread-dark mb-6">
                1. Kdy si chcete objednávku vyzvednout?
              </h2>
              <DateTimePicker
                selectedDate={pickupDate}
                selectedTime={pickupTime}
                onSelect={handleDateTimeSelect}
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="btn-primary"
                >
                  Pokračovat
                </button>
              </div>
            </div>
          )}

          {/* Krok 2: Kontaktní údaje */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-bread-dark mb-6">
                2. Vaše kontaktní údaje
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jméno a příjmení *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    className="input-field"
                    placeholder="Jan Novák"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                    className="input-field"
                    placeholder="jan@email.cz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="+420 123 456 789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poznámka k objednávce
                  </label>
                  <textarea
                    value={customerInfo.note}
                    onChange={(e) => handleCustomerInfoChange('note', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Speciální požadavky..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Zpět
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="btn-primary"
                >
                  Pokračovat
                </button>
              </div>
            </div>
          )}

          {/* Krok 3: Platba */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-bread-dark mb-6">
                3. Způsob platby
              </h2>
              <div className="space-y-3">
                {config.payments.card && (
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-5 h-5 text-primary-500"
                    />
                    <div>
                      <span className="font-medium">💳 Kartou online</span>
                      <p className="text-sm text-gray-500">Bezpečná platba přes platební bránu</p>
                    </div>
                  </label>
                )}
                {config.payments.onPickup && (
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="onPickup"
                      checked={paymentMethod === 'onPickup'}
                      onChange={() => setPaymentMethod('onPickup')}
                      className="w-5 h-5 text-primary-500"
                    />
                    <div>
                      <span className="font-medium">💵 Při vyzvednutí (lze hotově i kartou)</span>
                      <p className="text-sm text-gray-500">Platba při vyzvednutí na prodejně</p>
                    </div>
                  </label>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  Zpět
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Odesílám...' : 'Odeslat objednávku'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shrnutí objednávky */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-4">
            <h3 className="font-bold text-bread-dark mb-4">Shrnutí objednávky</h3>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>{item.product.price * item.quantity} Kč</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Celkem</span>
                <span className="text-primary-600">{totalPrice} Kč</span>
              </div>
            </div>

            {pickupDate && pickupTime && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-primary-700">
                  📅 Vyzvednutí: {formatDate(pickupDate)} v {pickupTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
