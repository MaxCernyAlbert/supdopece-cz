import { NextRequest, NextResponse } from 'next/server';

// Toto je příklad API route pro Stripe Checkout
// Pro produkci budete potřebovat:
// 1. npm install stripe
// 2. Stripe účet a API klíče
// 3. Nastavit environment variables

/*
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
*/

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface OrderRequest {
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    note?: string;
  };
  pickupDate: string;
  pickupTime: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    const { items, customerInfo, pickupDate, pickupTime } = body;

    // Validace
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Košík je prázdný' },
        { status: 400 }
      );
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json(
        { error: 'Vyplňte všechny povinné údaje' },
        { status: 400 }
      );
    }

    // Výpočet celkové ceny
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Zde by byla Stripe integrace:
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'czk',
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price * 100, // Stripe používá halíře
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/objednavka/potvrzeni?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/objednavka`,
      customer_email: customerInfo.email,
      metadata: {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerNote: customerInfo.note || '',
        pickupDate,
        pickupTime,
      },
    });

    return NextResponse.json({ url: session.url });
    */

    // Demo response
    return NextResponse.json({
      success: true,
      message: 'Objednávka vytvořena (demo mód)',
      orderId: `ORD-${Date.now()}`,
      totalPrice,
      pickupDate,
      pickupTime,
    });
  } catch (error) {
    console.error('Chyba při vytváření objednávky:', error);
    return NextResponse.json(
      { error: 'Chyba při zpracování objednávky' },
      { status: 500 }
    );
  }
}
