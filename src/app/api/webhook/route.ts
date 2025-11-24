import { NextRequest, NextResponse } from 'next/server';

// Stripe Webhook pro zpracování plateb
// Po úspěšné platbě Stripe pošle notifikaci na tento endpoint

/*
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
*/

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // const signature = request.headers.get('stripe-signature')!;

    // Ověření podpisu od Stripe
    /*
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Zpracování různých typů událostí
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Uložit objednávku do databáze
        // Odeslat potvrzovací email
        // Notifikovat pekárnu

        console.log('Platba úspěšná:', session.id);
        console.log('Metadata:', session.metadata);

        // Příklad: uložení do databáze
        // await db.orders.create({
        //   stripeSessionId: session.id,
        //   customerEmail: session.customer_email,
        //   customerName: session.metadata?.customerName,
        //   customerPhone: session.metadata?.customerPhone,
        //   pickupDate: session.metadata?.pickupDate,
        //   pickupTime: session.metadata?.pickupTime,
        //   totalAmount: session.amount_total,
        //   status: 'paid',
        // });

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    */

    // Demo response
    console.log('Webhook received (demo):', body);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
